import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

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
  const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${process.env.NEXT_PUBLIC_APP_ID}`;
  const req_uuid = req.body.signal;
  const reqBody = {
    nullifier_hash: req.body.nullifier_hash,
    merkle_root: req.body.merkle_root,
    proof: req.body.proof,
    verification_level: req.body.verification_level,
    action: req.body.action,
    signal: req.body.signal,
  };
  fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  }).then(async (verifyRes) => {
    const response = await verifyRes.json();
    const client = await createClient({
      url: process.env.REDIS_URL,
      socket: { tls: true },
    })
      .on("error", (err) => console.error("Redis Client Error", err))
      .connect();
    if (verifyRes.status == 200) {
      client.set(req_uuid, req.body.verification_level, { EX: 60 * 15 });
      res.status(200).send({
        code: "success",
        detail: "This action verified correctly!",
      });
    } else {
      // This is where you should handle errors from the World ID /verify endpoint. Usually these errors are due to an invalid credential or a credential that has already been used.
      // For this example, we'll just return the error code and detail from the World ID /verify endpoint.
      res
        .status(verifyRes.status)
        .send({ code: response.code, detail: response.detail });
    }
  });
}
