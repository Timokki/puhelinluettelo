// Mongon ja mongoosen komentorivitesteri.

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const password = process.argv[2]

//console.log("process.argv.length: ", process.argv.length)
const addingNew = (process.argv.length>3) ? true : false

const url = `mongodb+srv://fullstack:${password}@cluster0.6kjcn.mongodb.net/myFirstDatabase?retryWrites=true`

mongoose.connect(url)

// Scheema kertoo mongooselle, miten oliot tulee tallettaa tietokantaan.
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  number: {
    type: String,
    minlength: 10,
    required: true
  }
})

personSchema.plugin(uniqueValidator)

const Person = mongoose.model('Person', personSchema)
//console.log(addingNew)
if (addingNew)
{
  const nameArg = process.argv[3]
  const numberArg = process.argv[4]

  // Muistiinpano luodaan mongoose.model konstruktorifunktion avulla.
  const person = new Person({
    name: nameArg,
    number: numberArg
  })

  // Koska oliot on luotu modelien konstruktorifunktiolla, niillä on kaikki modelien
  // ominaisuudet eli joukko metodeja, joiden avulla olioita voidaan mm. tallettaa tietokantaan.
  // eslint-disable-next-line no-unused-vars
  person.save().then(response => {
    console.log('person saved!')
    mongoose.connection.close() // TÄRKEÄ, yhteys tietokantaan suljetaan vasta kun tallennus on valmis.
  })
} else {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}