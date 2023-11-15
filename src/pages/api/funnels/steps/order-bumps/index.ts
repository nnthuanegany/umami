import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import {
  FunnelStepProductSettings,
  GenericObject,
  NextApiRequestQueryBody,
  YupRequest,
} from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getFunnelStepById, updateFunnelStep } from 'queries';
import * as yup from 'yup';
import { FunnelStep } from '@prisma/client';
import { canUpdateFunnelStep } from 'lib/auth';

export interface FunnelStepOrderBumpRequestQuery {}

export interface FunnelStepOrderBumpRequestBody {
  funnelStepId: string;
  name: string;
  priority: number;
  design?: GenericObject;
  products?: FunnelStepProductSettings[];
}

const schema: YupRequest = {
  POST: yup.object().shape({
    funnelStepId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    priority: yup.number().integer().min(1).max(20).required(),
    products: yup.array(yup.object()).default([]),
  }),
};

export default async (
  req: NextApiRequestQueryBody<FunnelStepOrderBumpRequestQuery, FunnelStepOrderBumpRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const { funnelStepId, name, design, products } = req.body;

    const funnelStep = await getFunnelStepById(funnelStepId);

    if (!(await canUpdateFunnelStep(req.auth, funnelStep))) {
      return unauthorized(res);
    }

    const parsedFunnelStep = parseFunnelStep(funnelStep);
    const orderBump = {
      id: uuid(),
      name,
      priority: 1,
      products: products.map(p => {
        p.id = uuid();
        return p;
      }),
      design,
    };

    if (
      parsedFunnelStep.settings.orderBumps &&
      Array.isArray(parsedFunnelStep.settings.orderBumps)
    ) {
      orderBump.priority = parsedFunnelStep.settings.orderBumps.length + 1;
      parsedFunnelStep.settings.orderBumps.push(orderBump);
    } else {
      parsedFunnelStep.settings.orderBumps = [orderBump];
    }

    const result = await updateFunnelStep(funnelStepId, {
      settings: JSON.stringify(parsedFunnelStep.settings),
    } as any);

    return ok(res, parseFunnelStep(result));
  }

  return methodNotAllowed(res);
};

function parseFunnelStep(funnelStep: FunnelStep): GenericObject {
  return {
    ...funnelStep,
    settings: JSON.parse(funnelStep.settings),
  };
}
