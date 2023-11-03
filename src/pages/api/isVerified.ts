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
  const uuid = req.query.id as string;
  console.log("uuid: ", uuid)
  const client = await createClient({
    url: process.env.REDIS_URL, 
    socket: { tls: true }
  })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
  const nullifier_hash = await client.get(uuid);
  if (nullifier_hash) {
    res.status(200).send({ code: "success", detail: "This credential has been verified!" });
  } else {
    res.status(404).send({ code: "not_found", detail: "This credential has not been verified!" });
  }
}
