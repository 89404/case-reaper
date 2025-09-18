import CaseData from '../../../seed/cases.js'

export default defineEventHandler(async (event) => {
  const caseId = getRouterParam(event, 'id')
  
  const caseItem = CaseData.find(c => c._id === caseId)
  
  if (!caseItem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Case not found'
    })
  }
  
  return caseItem.skins || []
})