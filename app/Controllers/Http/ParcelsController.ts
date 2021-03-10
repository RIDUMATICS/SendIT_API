import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Parcel from 'App/Models/Parcel';

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
    });

    if (auth.user && auth.user.id) {
      const parcel = await Parcel.create({
        ...data,
        placedBy: auth.user.id,
        status: 'placed',
      });
      response.created({ status: 201, data: { parcel } });
    }
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

    if (auth.user) {
      const resp = await Parcel.query()
        .where('placedBy', auth.user.id)
        .paginate(page, limit);
      const { meta, data } = resp.toJSON();
      return response.ok({ status: 200, data, meta }); // meta contains details for pagination
    }
    response.unauthorized({
      status: 401,
      error: 'Unauthorized',
    });
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
        id: schema.number([
          rules.unsigned(),
          rules.exists({
            table: 'parcels',
            column: 'id',
            where: { placedBy: auth.user?.id },
          }),
        ]),
      }),
      messages: {
        number: 'Only number allowed',
        unsigned: 'Only positive number',
        exists: 'Parcel with the {{field}} does not exist',
      },
    });

    const parcel = await Parcel.find(id);

    response.ok({ status: '200', data: parcel });
  }

  // Fetch a specific delivery order. { auth: [ admin ]}
  public async getParcelDetails({ response, params }: HttpContextContract) {
    const { id } = await validator.validate({
      data: params,
      schema: schema.create({
        id: schema.number([
          rules.unsigned(),
          rules.exists({
            table: 'parcels',
            column: 'id',
          }),
        ]),
      }),
      messages: {
        number: 'Only number allowed',
        unsigned: 'Only positive number',
        exists: 'Parcel with the {{field}} does not exist',
      },
    });

    const parcel = await Parcel.find(id);

    response.ok({ status: '200', data: parcel });
  }
}
