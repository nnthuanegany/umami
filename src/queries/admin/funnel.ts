import { Prisma, Funnel, FunnelStep } from '@prisma/client';
import prisma from 'lib/prisma';
import { FilterResult, FunnelSearchFilter, FunnelStepSearchFilter } from 'lib/types';

export async function createFunnel(data: Prisma.FunnelCreateInput): Promise<Funnel> {
  return prisma.client.funnel.create({ data });
}

export async function getFunnelById(funnelId: string): Promise<Funnel> {
  return prisma.client.funnel.findUnique({
    where: {
      id: funnelId,
    },
  });
}

export async function updateFunnel(
  funnelId: string,
  data: Prisma.FunnelUpdateInput,
): Promise<Funnel> {
  return prisma.client.funnel.update({ where: { id: funnelId }, data });
}

export async function deleteFunnel(funnelId: string): Promise<Funnel> {
  return prisma.client.funnel.delete({ where: { id: funnelId } });
}

export async function getFunnels(
  params: FunnelSearchFilter,
  options?: { include?: Prisma.FunnelInclude },
): Promise<FilterResult<Funnel[]>> {
  const { query, userId, websiteId, includeTeams } = params;

  const mode = prisma.getSearchMode();

  const where: Prisma.FunnelWhereInput = {
    userId,
    websiteId,
    AND: [
      {
        OR: [
          {
            userId,
          },
          {
            ...(includeTeams && {
              website: {
                teamWebsite: {
                  some: {
                    team: {
                      teamUser: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        ],
      },
      {
        OR: [
          {
            name: {
              contains: query,
              ...mode,
            },
          },
          {
            description: {
              contains: query,
              ...mode,
            },
          },
          {
            user: {
              username: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              name: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              domain: {
                contains: query,
                ...mode,
              },
            },
          },
        ],
      },
    ],
  };

  const [pageFilters, pageInfo] = prisma.getPageFilters(params);

  const funnels = await prisma.client.funnel.findMany({
    where,
    ...pageFilters,
    ...(options?.include && { include: options.include }),
  });

  const count = await prisma.client.funnel.count({
    where,
  });

  return {
    data: funnels,
    count,
    ...pageInfo,
  };
}

export async function getFunnelsByUserId(
  userId: string,
  filter?: FunnelSearchFilter,
): Promise<FilterResult<Funnel[]>> {
  return getFunnels(
    { userId, ...filter },
    {
      include: {
        website: {
          select: {
            domain: true,
            userId: true,
          },
        },
      },
    },
  );
}

export async function getFunnelsByWebsiteId(
  websiteId: string,
  filter: FunnelSearchFilter,
): Promise<FilterResult<Funnel[]>> {
  return getFunnels({ websiteId, ...filter });
}

export async function createFunnelStep(data: Prisma.FunnelStepCreateInput): Promise<FunnelStep> {
  return prisma.client.funnelStep.create({ data });
}

export async function getFunnelStepById(funnelStepId: string): Promise<FunnelStep> {
  return prisma.client.funnelStep.findUnique({
    where: {
      id: funnelStepId,
    },
  });
}

export async function updateFunnelStep(
  funnelStepId: string,
  data: Prisma.FunnelStepUpdateInput,
): Promise<FunnelStep> {
  return prisma.client.funnelStep.update({ where: { id: funnelStepId }, data });
}

export async function deleteFunnelStep(funnelStepId: string): Promise<FunnelStep> {
  return prisma.client.funnelStep.delete({ where: { id: funnelStepId } });
}

export async function getFunnelSteps(
  params: FunnelStepSearchFilter,
  options?: { include?: Prisma.FunnelStepInclude },
): Promise<FilterResult<FunnelStep[]>> {
  const { query, userId, websiteId, funnelId, includeTeams } = params;

  const mode = prisma.getSearchMode();

  const where: Prisma.FunnelStepWhereInput = {
    userId,
    websiteId,
    funnelId,
    AND: [
      {
        OR: [
          {
            userId,
          },
          {
            ...(includeTeams && {
              website: {
                teamWebsite: {
                  some: {
                    team: {
                      teamUser: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        ],
      },
      {
        OR: [
          {
            name: {
              contains: query,
              ...mode,
            },
          },
          {
            description: {
              contains: query,
              ...mode,
            },
          },
          {
            user: {
              username: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              name: {
                contains: query,
                ...mode,
              },
            },
          },
          {
            website: {
              domain: {
                contains: query,
                ...mode,
              },
            },
          },
        ],
      },
    ],
  };

  const [pageFilters, pageInfo] = prisma.getPageFilters(params);

  const funnelSteps = await prisma.client.funnelStep.findMany({
    where,
    ...pageFilters,
    ...(options?.include && { include: options.include }),
  });

  const count = await prisma.client.funnelStep.count({
    where,
  });

  return {
    data: funnelSteps,
    count,
    ...pageInfo,
  };
}

export async function getFunnelStepsByUserId(
  userId: string,
  filter?: FunnelStepSearchFilter,
): Promise<FilterResult<FunnelStep[]>> {
  return getFunnelSteps(
    { userId, ...filter },
    {
      include: {
        website: {
          select: {
            domain: true,
            userId: true,
          },
        },
      },
    },
  );
}

export async function getFunnelStepsByWebsiteId(
  websiteId: string,
  filter: FunnelStepSearchFilter,
): Promise<FilterResult<FunnelStep[]>> {
  return getFunnelSteps({ websiteId, ...filter });
}
