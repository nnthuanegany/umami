import { canDeleteFunnel, canUpdateFunnel, canViewFunnel } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, YupRequest } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteFunnel, getFunnelById, updateFunnel } from 'queries';
import * as yup from 'yup';

export interface FunnelRequestQuery {
  id: string;
}

export interface FunnelRequestBody {
  websiteId: string;
  name: string;
  description: string;
}

const schema: YupRequest = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    websiteId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    description: yup.string().max(500),
  }),
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<FunnelRequestQuery, FunnelRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: funnelId } = req.query;
  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const funnel = await getFunnelById(funnelId);

    if (!(await canViewFunnel(req.auth, funnel))) {
      return unauthorized(res);
    }

    return ok(res, funnel);
  }

  if (req.method === 'POST') {
    const { websiteId, name, description } = req.body;

    const funnel = await getFunnelById(funnelId);

    if (!(await canUpdateFunnel(req.auth, funnel))) {
      return unauthorized(res);
    }

    const result = await updateFunnel(funnelId, {
      websiteId,
      userId,
      name,
      description,
    } as any);

    return ok(res, result);
  }

  if (req.method === 'DELETE') {
    const funnel = await getFunnelById(funnelId);

    if (!(await canDeleteFunnel(req.auth, funnel))) {
      return unauthorized(res);
    }

    await deleteFunnel(funnelId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
