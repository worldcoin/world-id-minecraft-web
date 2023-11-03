import { CredentialType, IDKitWidget } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [app_id, setAppId] = useState("");
	const [id, setId] = useState("");

	useEffect(() => {
		const params = router.query;
		setAppId(params.app_id as string);
		setId(params.id as string);
	}, [router.isReady]);

	const onSuccess = (result: ISuccessResult) => {
		window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
	};

	const handleProof = async (result: ISuccessResult) => {
		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			credential_type: result.credential_type,
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
			throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
		}
	};

	return (
		<div>
			<div className="flex flex-col items-center justify-center align-middle h-screen">
				<p className="text-2xl mb-5">Minecraft World ID</p>
				<IDKitWidget
					action={process.env.NEXT_PUBLIC_WLD_ACTION_NAME!}
					app_id={app_id}
					signal={id}
					onSuccess={onSuccess}
					handleVerify={handleProof}
					credential_types={[CredentialType.Orb, CredentialType.Phone]}
					autoClose
					walletConnectProjectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!}
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
