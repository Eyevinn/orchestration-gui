import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { deleteInventorySourceItem } from '../../../../../api/manager/inventory';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    await deleteInventorySourceItem(params._id);
    return new NextResponse(null, {
      status: 200
    });
  } catch (error) {
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
