import type {NextApiRequest, NextApiResponse} from 'next'
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg'
import { validarTokenJWT } from '../../../middleware/validarTokenJWT'
import { conectarMongoDB } from '../../../middleware/conectarMongoDB'
import { usuarioModels } from '../../../models/usuarioModels'
import { publicacaoModels } from '../../../models/publicacaoModels'

const comentarioEndpoint = async (req : NextApiRequest, res : NextApiResponse <respostaPadraoMsg | any>) => {
    try {
        if(req.method === 'PUT'){
            //pegando id do usuario no query
            const {userId, id} = req.query;
            const usuarioLogado = await usuarioModels.findById(userId);
            if (!usuarioLogado){
                return res.status(400).json({erro : 'Usuario nao encontrado'})
            }
            // pegano publicaçao do query
            const publicacao = await publicacaoModels.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicaçao nao encontrada'})
            }
            //pegando publicaçao do body
            
            if(!req.body || !req.body.comentario || req.body.comentario.length < 2 ){
                return res.status(400).json({erro : 'Comentario nao é valido'})
            }

            const comentario = {
                usuarioId : usuarioLogado._id,
                nome : usuarioLogado.nome,
                comentario :req.body.comentario
            }
            publicacao.comentario.push(comentario)
            await publicacaoModels.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                 return res.status(200).json({msg : 'Comentario adicionado com sucesso'});
        }
        

        return res.status(405).json({erro : 'Metodo informado nao é valido'})

    } catch (e) {
        console.log (e);
        return res.status(500).json({erro : 'Ocorreu erro ao adcionar comentario'});
    }
}

export default validarTokenJWT(conectarMongoDB(comentarioEndpoint));