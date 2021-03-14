/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/register', 'AuthController.register');
  Route.post('/login', 'AuthController.login');
}).prefix('auth');

// Route for user
Route.group(() => {
  Route.post('parcels', 'ParcelsController.create');
  Route.get('user/parcels', 'ParcelsController.getUserParcels'); // get all parcels that belongs to the user
  Route.get('user/parcels/:id', 'ParcelsController.getUserParcelDetails'); // get parcels details that belongs to the user
  Route.patch('parcels/:id/destination', 'ParcelsController.updateDestination');
  Route.patch('parcels/:id/cancel', 'ParcelsController.cancelDelivery');
})
  .prefix('api/v1')
  .middleware(['auth']);

// Route for Admin
Route.group(() => {
  Route.get('parcels', 'ParcelsController.getParcels'); // admin get all parcels
  Route.get('parcels/:id', 'ParcelsController.getParcelDetails'); //admin get any parcel details
  Route.patch('parcels/:id/status', 'ParcelsController.updateStatus');
  Route.patch(
    'parcels/:id/currentlocation',
    'ParcelsController.updateCurrentLocation'
  );
})
  .prefix('api/v1')
  .middleware(['auth', 'admin']);
