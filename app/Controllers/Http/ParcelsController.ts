import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Parcel from 'App/Models/Parcel';
import { MyReporter } from 'App/Validators/Reporters/MyReporter';
import { DateTime } from 'luxon';

export default class ParcelsController {
  // Create a parcel delivery order.. { auth: [ user ] }
  public async create({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        weight: schema.number([rules.unsigned()]),
        weightmetric: schema.string(),
        from: schema.string(),
        to: schema.string(),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.create({
      ...data,
      placedBy: auth.user!.id,
      status: 'placed',
    });
    response.created({
      status: 201,
      message: 'order created',
      data: { parcel },
    });
  }

  // Fetch all parcel delivery orders { auth: [ admin] }
  public async getParcels({ request, response }: HttpContextContract) {
    const page = request.input('page', 1);
    const limit = request.input('limit', 10);

    const parcels = await Parcel.query().paginate(page, limit);
    const { data, meta } = parcels.toJSON();

    response.ok({ status: 200, data, meta });
  }

  // Fetch all parcel delivery order by a specific user. { auth: [ user ] }
  public async getUserParcels({
    request,
    response,
    auth,
  }: HttpContextContract) {
    const page = request.input('page', 1);
    const limit = request.input('limit', 10);

    const resp = await Parcel.query()
      .where('placedBy', auth.user!.id)
      .paginate(page, limit);

    const { meta, data } = resp.toJSON();
    return response.ok({ status: 200, data, meta }); // meta contains details for pagination
  }

  // Fetch a specific delivery order owned by the user. { auth: [ user ] }
  public async getUserParcelDetails({
    response,
    params,
    auth,
  }: HttpContextContract) {
    const { id } = await validator.validate({
      data: params,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.query()
      .where('id', id)
      .andWhere('placedBy', auth.user!.id)
      .preload('user')
      .first();

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    response.ok({ status: '200', data: parcel });
  }

  // Fetch a specific delivery order. { auth: [ admin ]}
  public async getParcelDetails({ response, params }: HttpContextContract) {
    const { id } = await validator.validate({
      data: params,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only numbers are allowed',
        unsigned: 'Only positive numbers',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.query().where('id', id).preload('user').first();

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    response.ok({ status: '200', data: parcel });
  }

  /*
  Change the destination of a specific parcel delivery order. Only the user who
  created the parcel should be able to change the destination of the parcel. A
  parcel’s destination can only be changed if it is yet to be delivered.
  */
  public async updateDestination({
    response,
    request,
    params,
    auth,
  }: HttpContextContract) {
    const data = { ...request.all(), ...params };

    const { id, to } = await validator.validate({
      data,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
        to: schema.string(),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.query()
      .where('id', id)
      .andWhere('placedBy', auth.user!.id)
      .first();

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    // update delivery destination
    parcel.to = to;

    const updatedParcel = await parcel.save();

    response.ok({
      status: 200,
      message: 'Parcel destination updated',
      data: updatedParcel,
    });
  }

  // Cancel a specific parcel delivery order.
  public async cancelDelivery({ response, params, auth }: HttpContextContract) {
    const { id } = await validator.validate({
      data: params,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.query()
      .where('id', id)
      .andWhere('placedBy', auth.user!.id)
      .first();

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    parcel.status = 'cancelled';
    const cancelledParcel = await parcel.save();

    response.ok({
      status: 200,
      message: 'order canceled',
      data: cancelledParcel,
    });
  }

  //   Change the status of a specific parcel delivery order. Only the Admin is allowed to access this endpoint.

  public async updateStatus({
    request,
    params,
    response,
  }: HttpContextContract) {
    const data = { ...request.all(), ...params };

    const { id, status } = await validator.validate({
      data,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
        status: schema.enum(['placed', 'transiting', 'delivered']),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        enum: 'Not accepted use [placed, transiting, delivered]',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.find(id);

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    if (parcel.status === 'cancelled') {
      return response.unprocessableEntity({
        status: 422,
        message: 'Order has been cancelled',
      });
    }

    if (status === 'delivered') {
      parcel.deliveredOn = DateTime.now();
    }

    parcel.status = status;
    const updatedParcel = await parcel.save();

    response.ok({
      status: 200,
      message: 'Parcel status updated',
      data: updatedParcel,
    });
  }

  // Change the present location of a specific parcel delivery order. Only the Admin is allowed to access this endpoint.
  public async updateCurrentLocation({
    response,
    request,
    params,
  }: HttpContextContract) {
    const data = { ...request.all(), ...params };

    const { id, currentLocation } = await validator.validate({
      data,
      schema: schema.create({
        id: schema.number([rules.unsigned()]),
        currentLocation: schema.string(),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        number: 'Only number allowed',
        unsigned: 'Only positive number',
      },
      reporter: MyReporter,
    });

    const parcel = await Parcel.find(id);

    if (!parcel) {
      return response.notFound({ status: 404, message: 'Parcel not found' });
    }

    // update delivery destination
    parcel.currentLocation = currentLocation;

    const updatedParcel = await parcel.save();

    response.ok({
      status: 200,
      message: 'Parcel location updated',
      data: updatedParcel,
    });
  }
}
