import CaseData from '../../../seed/cases.js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const csCase = CaseData.find(c => c._id === id)
  if (!csCase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Case niet gevonden'
    })
  }
  
  // Select random item from case
  const item = csCase.skins[Math.floor(Math.random() * csCase.skins.length)]
  
  // TODO: Add user authentication and inventory management here
  // For now, just return the item
  
  return item
})