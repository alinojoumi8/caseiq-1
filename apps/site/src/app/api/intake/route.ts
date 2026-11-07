import { handleIntake } from '../../../lib/leadRequest';

// POST only. Validation, spam checks, the rate limit and delivery live in lib/leadRequest.ts.
export async function POST(req: Request) {
  return handleIntake(req);
}
