import type { NextApiRequest,NextApiResponse } from "next";
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg'
import { validarTokenJWT } from "../../../middleware/validarTokenJWT";
import { conectarMongoDB } from "../../../middleware/conectarMongoDB";
import { publicacaoModels } from "../../../models/publicacaoModels";
import { usuarioModels } from "../../../models/usuarioModels";

const likeEndpoint = async (req : NextApiRequest, res : NextApiResponse <respostaPadraoMsg | any>) => {
    try {
        if(req.method === 'PUT'){
            //ID da publicaçao 
            const {id} = req?.query;
            const publicacao = await publicacaoModels.findById(id);
            if (!publicacao){
                return res.status(400).json({erro : 'Publicaçao não encontrada'})
            }
            //ID do usuario
            const {userId} = req?.query;
            const usuario = await usuarioModels.findById(userId)
            if(!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado'});
            }

            //administrando os likes
            const indexDoUsuarioNoIndex = publicacao.likes.findIndex((e:any)=> e.toString() === usuario._id.toString())
            
            //se o index for -1 sinal q ele crte a foto
            if(indexDoUsuarioNoIndex != -1){
                publicacao.likes.splice(indexDoUsuarioNoIndex, 1);
                await publicacaoModels.findByIdAndUpdate({_id : publicacao.id},publicacao)
                return res.status(200).json({msg : 'Publicacao descurtida com sucesso'})

            }else{
                //se o index for -1 sinal q ele nao curte a foto
                publicacao.likes.push(usuario._id);
                await publicacaoModels.findByIdAndUpdate({_id : publicacao.id},publicacao)
                return res.status(200).json({msg : 'Publicacao curtida com sucesso'})
            }

        }
        return res.status(405).json({erro : 'Metodo informado não é valido'});

    } catch (e) {
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu erro ao curtir/descurtir'})
    }
}

export default validarTokenJWT(conectarMongoDB(likeEndpoint));