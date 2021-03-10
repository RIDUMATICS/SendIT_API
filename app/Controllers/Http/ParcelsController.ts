import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import Parcel from 'App/Models/Parcel';

export default class ParcelsController {
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
}
