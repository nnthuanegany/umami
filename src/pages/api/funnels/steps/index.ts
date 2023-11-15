import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { GenericObject, NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createFunnelStep, getFunnelStepsByUserId } from 'queries';
import * as yup from 'yup';
import { FunnelStep } from '@prisma/client';

export interface FunnelStepsRequestQuery extends SearchFilter {}

export interface FunnelStepRequestBody {
  websiteId: string;
  funnelId: string;
  name: string;
  type: string;
  description: string;
  step: number;
  settings: {
    [key: string]: any;
  };
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    funnelId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    type: yup
      .string()
      .matches(/sales-page|checkout-page|one-click-upsells|thank-you-page/i)
      .required(),
    description: yup.string().max(500),
    step: yup.number().integer().min(1).max(20).required(),
    settings: yup.object().default({}),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, FunnelStepRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, query, pageSize } = req.query;

    const filterResult = await getFunnelStepsByUserId(userId, {
      page,
      pageSize: +pageSize || undefined,
      query,
      includeTeams: true,
    });

    const parsedResult: GenericObject = { ...filterResult };

    if (parsedResult && Array.isArray(parsedResult.data)) {
      parsedResult.data = parsedResult.data.map(parseFunnelStep);
    }

    return ok(res, parsedResult);
  }

  if (req.method === 'POST') {
    const { websiteId, funnelId, type, name, description, step, settings } = req.body;

    const result = await createFunnelStep({
      id: uuid(),
      userId,
      websiteId,
      funnelId,
      type,
      name,
      description,
      step,
      settings: JSON.stringify(settings),
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
