const { json } = require('express')
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('build'))
app.use(cors())
/* Ilman json-parserin lisäämistä eli komentoa app.use(express.json()) 
pyynnön kentän body arvo olisi ollut määrittelemätön. 
json-parserin toimintaperiaatteena on, että se ottaa pyynnön mukana olevan JSON-muotoisen datan, 
muuttaa sen JavaScript-olioksi ja sijoittaa request-olion kenttään body ennen kuin routen 
käsittelijää kutsutaan. */
app.use(express.json())
//app.use(morgan('tiny'))
morgan.token('personInfo', (request, response) =>
{
  return JSON.stringify(request.body)
})

// Route juureen. Routet ovat tapahtumankäsittelijöitä, jotka käsittelevät pyynnöt osoitteeseen.
// request parametri sisältää pyynnön tiedot ja responsen avulla määritellään miten pyyntöön vastataan

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// Route /api/persons hakemistoon
app.get('/api/persons', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

// Route /api/persons/id hakemistoon
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {    
      res.json(person)  
    } 
    else {
        res.status(404).end()  
      }
  })
  /* catch-lohko jossa käsitellään tapaukset, joissa findById-metodin 
  palauttama promise päätyy rejected-tilaan
  */
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

// Route /info hakemistoon
app.get('/info', (req, res) => {
    console.log("!!!! /info route")
    let reqTime = new Date(Date.now())
    morgan(':method :url :status :res[content-length] - :response-time ms')
    res.send(
        `phonebook has info for ${persons.length} people <br>
        ${reqTime.toString()}`
    )
  })

  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personInfo'))

  app.post('/api/persons', (request, response) => {
    //console.log(`request.body: ${request.body.name}`)
    const body = request.body

    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing'
      })
    }

    Person.find({}).then(person => {
      console.log("person: ", person)
      if (person.some(p => p.name === body.name )){
        return response.status(400).json({ 
          error: 'Name must be unique' 
        })
      }
    })
    
    const person = new Person({
      name: body.name,
      number: body.number
    })
  
    /*Pyyntöön vastataan save-operaation takaisinkutsufunktion sisällä. 
    Näin varmistutaan, että operaation vastaus tapahtuu vain, jos operaatio 
    on onnistunut. Palaamme virheiden käsittelyyn myöhemmin.*/
    console.log("person.save() seuraavaksi:", person)
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })

    //persons = persons.concat(person)
  
    response.json(person)
  })

  // Numeron päivitys jo olemassa olevalle henkilölle.
  app.put('/api/persons/:id', (request, response, next) => {

    console.log("!!!!! app.put request.body: ", request.body)
    const body = request.body

    const person = {
      name: body.name,
      number: body.number
    }

    console.log("!!!! request.params.id: ", request.params.id)
    Person.findByIdAndUpdate(request.params.id, person, {new : true})
    .then(updatePerson => {
      response.status(204).json(updatePerson)
    })
    .catch(error => next(error))
})

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
  }
  
  // tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
  app.use(errorHandler)

  const generateId = () => {
    const newId = Math.floor(Math.random() * 38000)

    return newId
    // Jos person-lenght on isompi kuin 0, niin maxId saa arvokseen 
    /*const maxId = persons.length > 0
      ? Math.max(...persons.map(n => n.id)) //luodaan uusi taulukko jossa vain id-numerot, josta max()-funktiolla etsitään suurin arvo
      : 0

    return maxId + 1
    */
  }

//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})