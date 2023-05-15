import mongoose, {Schema} from "mongoose";

const seguidorSchema = new Schema({
    //quem ssegue
    usuarioId : {type : String, required : true},
    //quem esta sendo seguido
    usuarioSeguidoId : {type : String, required : true},

    segueEsseUsuario :{type : String, required : true}
});
export const seguidorModels = (mongoose.models.seguidores || 
    mongoose.model('seguidores', seguidorSchema));

