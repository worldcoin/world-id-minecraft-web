import { IDKitWidget, useIDKit } from "@worldcoin/idkit";
import { ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [server_uuid, setServerUUID] = useState(""); // The server's UUID to use as action
	const [req_uuid, setReqUUID] = useState(""); // The UUID of the verification request, used as signal

	const IDKit = useIDKit();

	useEffect(() => {
		const params = router.query;
		setServerUUID(params.serverUUID as string);
		setReqUUID(params.reqUUID as string);
		IDKit.setOpen(true);
	}, [router.isReady]);

	const onSuccess = () => {
		window.close();
	};

	const handleProof = async (result: ISuccessResult) => {
		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			verification_level: result.verification_level,
			action: server_uuid,
			signal: req_uuid,
		};
		const res: Response = await fetch("/api/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reqBody),
		})
		const data: VerifyReply = await res.json()
		if (res.status !== 200) {
			throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
		}
	};

	return (
		<div>
			<div className="flex flex-col items-center justify-center align-middle h-screen">
				<p className="text-2xl mb-5">Minecraft World ID</p>
				<IDKitWidget
					action={server_uuid}
					app_id={process.env.NEXT_PUBLIC_APP_ID! as `app_${string}`}
					signal={req_uuid}
					onSuccess={onSuccess}
					handleVerify={handleProof}
					verification_level={VerificationLevel.Device}
					autoClose
				>
					{({ open }) => 
						<button className="border border-black rounded-md" onClick={open}>
							<div className="mx-3 my-1">Verify with World ID</div>
						</button>
					}
				</IDKitWidget>
			</div>
		</div>
	);
}
