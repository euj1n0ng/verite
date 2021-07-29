import {
  decodeVerifiableCredential,
  RevocableCredential,
  JWT,
  unrevokeCredential
} from "@centre/verity"
import { apiHandler, notFound } from "../../../lib/api-fns"
import {
  findRevocationListForCredential,
  saveRevocationList
} from "../../../lib/database"
import { credentialSigner } from "../../../lib/signer"

export default apiHandler<string>(async (req, res) => {
  const jwt = req.body as JWT

  let credential: RevocableCredential
  try {
    credential = (await decodeVerifiableCredential(jwt)) as RevocableCredential
  } catch (e) {
    return notFound(res)
  }

  // Find the credential's revocation list
  const revocationList = await findRevocationListForCredential(credential)

  // Unrevoke the credential
  const list = await unrevokeCredential(
    credential,
    revocationList,
    credentialSigner()
  )

  // Persist the new revocation list
  await saveRevocationList(list)

  res.send(list.proof.jwt)
})