//Note pour professeur : J'ai écrit le code mais
// je n'ai pas réussi à prendre en main Postman
// donc je n'ai pas pu tester mes routes put, get, post et delete
// un message d'erreur s'affichait à chaque fois dans la partie "headers" du Postman

const express = require('express');
const router = express.Router();

// Lodash utils library
const _ = require('lodash');

//axios
const axios = require('axios')

//API
const API_URL = 'http://www.omdbapi.com';
const API_KEY = '67f90c98';

// Create raw data array
let movies = [{
    id: '0',
    movie: 'Movie',
    yearOfRelease: 'YearOfRelease',
    duration: 'Duration', // en minutes
    actors: ['Actor1', 'Actor2'],
    poster: 'img_default', // lien vers une image d'affiche,
    boxOffice: 'BoxOffice', // en USD$
    rottenTomatoesScore: 'Tomatoes'
}];

/*Create a movie / PUT a movie*/
router.put('/', (req, res) => {
    // Get name for the new movie from the body of the request
    const { movieName } = req.body;
    // Create new unique id
    const id = _.uniqueId();
    // Search in API
    //We use the axios.get because we want 
    //to get the data from the API and add it into our DB
    //and not adding a movie to the API (would be : axios.put)
    axios.get(`${API_URL}?t=${movieName}&apikey=${API_KEY}`).then((response) => {
    //Insert in Array
    movies.push({ 
        id: id,
        movie: response.data.Title,
        yearOfRelease: response.data.Year, 
        duration: response.data.Runtime, 
        actors: [response.data.Actors],
        poster: response.data.Poster,
        BoxOffice: response.data.BoxOffice,
        rottenTomatoesScore: response.data.Ratings[1].Value
        });
    })
    .catch(error => {
        // Handle error
        console.log(error);
    })
    .then(() => {
         //Return message
        res.json({
        message: 'Just added ${movieName}',
    })
    });
});
  
/*GET all movies (listing). */
router.get('/movies', (req, res) => { 
        // Get list of movie and return JSON
        res.status(200).json({movies});
});

/*GET one movie. */
router.get('/:id', (req, res) => {
    // Get id in params
    const { id } = req.params;
    // Find movie in Database
    const movieToGet = _.find(movies, ["id", id]);
    // Return
         // an error if the name of the movie is not found
         if (!movieToGet){
         res.status(404).json({ message: 'Movie with id : ${id} not found !' });
        }
        // the movie if it has been found
        else {
            res.status(200).json({ message: 'Movie found', movieToGet });
        }
});
  
/*Update movie / POST movie*/
router.post('/:id', (req, res) => { 
    // Get the :id of the movie we want to update from the params of the request
    const { id } = req.params;
    // Get the new data of the movie we want to update from the body of the request
    const { movieNewName } = req.body;
    // Find in Database
    const movieToUpdate = _.find(movies, ["id", id]);
    //API
    // Update all data with the new data    
    axios.get(`${API_URL}?t={movieToUpdate.movie}&apikey=${API_KEY}`).then((response) => {
        movieToUpdate.movie = movieNewName;
        movieToUpdate.yearOfRelease = response.data.Year;
        movieToUpdate.duration= response.data.Runtime;
        movieToUpdate.actors = [response.data.Actors];
        movieToUpdate.poster = response.data.Poster;
        movieToUpdate.BoxOffice = response.data.BoxOffice;
        movieToUpdate.rottenTomatoesScore= response.data.Ratings[1].Value
    })
    .catch(error => {
        console.log(error);
    })
    .then(() => {
        // Return message
        res.json({ message: 'Just updated ${id} with ${movie}', movieToUpdate });
    });
});
  
/*DELETE movie */
router.delete('/:id', (req, res) => { 
    // Get the :id of the movie we want to delete from the params of the request
    const { id } = req.params;
    // Remove from Database
    _.remove(movies, ["id", id]);
    // Return message
    res.json({
        message: 'Just removed ${id}'
    });
});
