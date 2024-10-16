import { NextRequest, NextResponse } from 'next/server';
import { Log } from '../../../../../api/logger';
import { isAuthenticated } from '../../../../../api/manager/auth';
import {
  deleteMultiviewersOnRunningProduction,
  putMultiviewersOnRunningProduction
} from '../../../../../api/manager/workflow';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { production, updates } = await request.json();
  return putMultiviewersOnRunningProduction(production, updates)
    .then((result) => {
      return new NextResponse(JSON.stringify(result));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: 'Could not update multiviewers'
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { production, removals } = await request.json();
  return deleteMultiviewersOnRunningProduction(production, removals)
    .then((result) => {
      return new NextResponse(JSON.stringify(result));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: 'Could not remove multiviewers'
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}
