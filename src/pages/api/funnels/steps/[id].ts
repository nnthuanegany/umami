import { canDeleteFunnelStep, canUpdateFunnelStep, canViewFunnelStep } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, YupRequest } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteFunnelStep, getFunnelStepById, updateFunnelStep } from 'queries';
import * as yup from 'yup';

export interface FunnelStepRequestQuery {
  id: string;
}

export interface FunnelStepRequestBody {
  websiteId: string;
  funnelId: string;
  type: string;
  name: string;
  description: string;
  step: number;
  settings: {
    [key: string]: any;
  };
}

const schema: YupRequest = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    funnelId: yup.string().uuid().required(),
    websiteId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    description: yup.string().max(500),
    step: yup.number().integer().min(1).max(20).required(),
    settings: yup.object().default({}),
  }),
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<FunnelStepRequestQuery, FunnelStepRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: funnelStepId } = req.query;
  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const funnelStep = await getFunnelStepById(funnelStepId);

    if (!(await canViewFunnelStep(req.auth, funnelStep))) {
      return unauthorized(res);
    }

    funnelStep.settings = JSON.parse(funnelStep.settings);

    return ok(res, funnelStep);
  }

  if (req.method === 'POST') {
    const { websiteId, funnelId, type, name, description, step, settings } = req.body;

    const funnelStep = await getFunnelStepById(funnelStepId);

    if (!(await canUpdateFunnelStep(req.auth, funnelStep))) {
      return unauthorized(res);
    }

    const result = await updateFunnelStep(funnelStepId, {
      websiteId,
      funnelId,
      userId,
      type,
      name,
      description,
      step,
      settings: JSON.stringify(settings),
    } as any);

    return ok(res, result);
  }

  if (req.method === 'DELETE') {
    const funnelStep = await getFunnelStepById(funnelStepId);

    if (!(await canDeleteFunnelStep(req.auth, funnelStep))) {
      return unauthorized(res);
    }

    await deleteFunnelStep(funnelStepId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
