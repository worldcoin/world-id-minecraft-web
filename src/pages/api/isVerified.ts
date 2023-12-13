import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from 'redis';

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("url: ", req.url)
  const req_uuid = req.query.id as string;
  console.log("req_uuid: ", req_uuid)
  const client = await createClient({
    url: process.env.REDIS_URL, 
    socket: { tls: true }
  })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
  const cred = await client.get(req_uuid);
  if (cred) {
    res.status(200).send(cred);
  } else {
    res.status(404).send({ code: "not_found", detail: "This credential has not been verified!" });
  }
}
