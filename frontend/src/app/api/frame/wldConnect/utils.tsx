import { CredentialType, VerificationLevel } from "@worldcoin/idkit-core"

export const credential_type_to_verification_level = (credential_type: CredentialType): VerificationLevel => {
	switch (credential_type) {
		case CredentialType.Orb:
			return VerificationLevel.Orb
		case CredentialType.Device:
			return VerificationLevel.Device
		default:
			throw new Error(`Unknown credential_type: ${credential_type}`)
	}
}
