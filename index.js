
const contactRouter = require('express').Router()


const validatePhoneNumber = (number) => {
  let code = number.slice(0,2).join('')
  let length = number.length

  return code == '+92' && length == 13
}

contactRouter.get('/', async (req, res) => {

  try{

    let contacts = await Contact.find({})  //get all contacts

    //can add pagination if required

    return res.json(contacts)
  }
  catch(err){
    return res.status(500).json({error: err.message})
  }
})


contactRouter.post('/', async (req, res) => {
  const { name, phoneNumber } = req.body

  let isNumberValid = validatePhoneNumber(phoneNumber)
  
  if(!isNumberValid){
    return res.status(400).json({error: 'phone number not valid'})
  }

  try{
    let newContact = new Contact({ name, phoneNumber })
    
    await newContact.save()

    return res.status(201).json(newContact)

  }
  catch(err){
    return res.status(500).json({ error: err.message })
  }
})


contactRouter.get('/search', async(req ,res) => {
  const { searchTerm } = req.query

  try {
    let contactsByName = await Contact.find({ name: { $regex: searchTerm } })
    let contactsByPhone = await Contact.find({ phoneNumber: { $regex: searchTerm } })

    let result = contactsByName.concat(contactsByPhone)

    return res.json(result)
    
  } catch (error) {
    return res.status(500).json({error: error.message})
  }
})

contactRouter.delete('/delete-by-phone', async(req ,res ) => {
  const { phoneNumber } = req.body

  try {
    await Contact.deleteOne({ phoneNumber: phoneNumber })

    return res.json({message: 'Record Deleted'})
  }
  catch(err){
    return res.status(500).json({error: err.message})
  }
})

contactRouter.put('/update-by-phone', async(req, res) => {
  const { name, phoneNumber } = req.body

  try {
    let existingContact = await Contact.findOne({ phoneNumber: phoneNumber})

    existingContact.name = name || existingContact.name
    existingContact.phoneNumber = phoneNumber || existingContact.phoneNumber

    await existingContact.save()

    return res.json(existingContact)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})