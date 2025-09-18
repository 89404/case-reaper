import CaseData from '../../seed/cases.js'

export default defineEventHandler(async (event) => {
  // Return cases without skins data for the listing
  return CaseData.map(c => ({ ...c, skins: undefined }))
})