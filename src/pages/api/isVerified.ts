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
  const uuid = req.query.id as string;
  const client = await createClient({
    url: process.env.REDIS_URL, 
    socket: { tls: true }
  })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
  const credential = await client.get(uuid);
  if (credential == "orb") {
    res.status(200).send("orb");
  } else if (credential == "device") {
    res.status(200).send("lite");
  } else {
    res.status(404).send({ code: "not_found", detail: "This credential has not been verified!" });
  }
}
