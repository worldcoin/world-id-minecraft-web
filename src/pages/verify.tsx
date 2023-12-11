import { CredentialType, IDKitWidget, useIDKit } from "@worldcoin/idkit";
import { ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [app_id, setAppId] = useState("app_" as `app_${string}`);
	const [id, setId] = useState("");

	const IDKit = useIDKit();

	useEffect(() => {
		const params = router.query;
		setAppId(params.app_id as `app_${string}`);
		setId(params.id as string);
		IDKit.setOpen(true);
	}, [router.isReady]);


	const onSuccess = (result: ISuccessResult) => {
		window.close();
	};

	const handleProof = async (result: ISuccessResult) => {
		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			credential_type: result.verification_level == VerificationLevel.Orb ? CredentialType.Orb : CredentialType.Device,
			action: process.env.NEXT_PUBLIC_WLD_ACTION_NAME,
			app_id: app_id,
			uuid: id,
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
			throw new Error(data.toString()); // Throw an error if verification fails
		}
	};

	return (
		<div>
			<div className="flex flex-col items-center justify-center align-middle h-screen">
				{/* <p className="text-2xl mb-5">Minecraft World ID</p> */}
				<IDKitWidget
					action={process.env.NEXT_PUBLIC_WLD_ACTION_NAME!}
					app_id={app_id}
					signal={id}
					verification_level={VerificationLevel.Lite}
					onSuccess={onSuccess}
					handleVerify={handleProof}
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
