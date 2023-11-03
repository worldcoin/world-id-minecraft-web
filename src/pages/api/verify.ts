import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from 'redis';

export const config = {
  api: {
    externalResolver: true,
  },
};

export type VerifyReply = {
  code: string;
  detail: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyReply>
) {
  const body = req.body;
  console.log("Received request to verify credential:\n", req.body);
  const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${req.body.app_id}`;
  const uuid = req.body.uuid;
  const reqBody = {
    nullifier_hash: req.body.nullifier_hash,
    merkle_root: req.body.merkle_root,
    proof: req.body.proof,
    credential_type: req.body.credential_type,
    action: req.body.action,
    signal: uuid,
  };
  console.log("Sending request to World ID /verify endpoint:\n", reqBody);
  fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  }).then((verifyRes) => {
    verifyRes.json().then(async (wldResponse) => {
      const client = await createClient({
        url: process.env.REDIS_URL, 
        socket: { tls: true }
      })
        .on('error', err => console.log('Redis Client Error', err))
        .connect();
      if (verifyRes.status == 200) {
        client.set(uuid, wldResponse.nullifier_hash, { 'EX': 60 * 60 * 24 });
        res.status(verifyRes.status).send({
          code: "success",
          detail: "This action verified correctly!",
        });
      } else {
        // This is where you should handle errors from the World ID /verify endpoint. Usually these errors are due to an invalid credential or a credential that has already been used.
        // For this example, we'll just return the error code and detail from the World ID /verify endpoint.
        res
          .status(verifyRes.status)
          .send({ code: wldResponse.code, detail: wldResponse.detail });
      }
    });
  });
}
