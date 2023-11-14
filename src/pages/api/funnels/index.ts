import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createFunnel, getFunnelsByUserId } from 'queries';
import * as yup from 'yup';

export interface FunnelsRequestQuery extends SearchFilter {}

export interface FunnelRequestBody {
  websiteId: string;
  name: string;
  description: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    description: yup.string().max(500),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, FunnelRequestBody>,
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

    const data = await getFunnelsByUserId(userId, {
      page,
      pageSize: +pageSize || undefined,
      query,
      includeTeams: true,
    });

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { websiteId, name, description } = req.body;

    const result = await createFunnel({
      id: uuid(),
      userId,
      websiteId,
      name,
      description,
    } as any);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
