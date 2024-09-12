import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { purgeInventorySourceItem } from '../../../../../api/manager/inventory';

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    const response = await purgeInventorySourceItem(params._id);
    if (response.acknowledged && response.modifiedCount === 0) {
      return new NextResponse(`Did not match requirements`, {
        status: 204
      });
    } else if (response.acknowledged) {
      return new NextResponse(null, {
        status: 200
      });
    } else {
      return new NextResponse(`Could not update database-status`, {
        status: 500
      });
    }
  } catch (error) {
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
