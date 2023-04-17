import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg}from '../../../types/respostaPadraoMsg';
import { conectarMongoDB } from '../../../middleware/conectarMongoDB';
import { validarTokenJWT } from '../../../middleware/validarTokenJWT';
import { usuarioModels } from '../../../models/usuarioModels';
import { seguidorModels } from '../../../models/seguidorMoldels';

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse <respostaPadraoMsg | any>) => {
    try {
        if (req.method === 'PUT'){
            const {userId, id} = req?.query;
            //id do usuario vindo do token = usuario logado/autenticado = quem esta fazendo as açoes
            const usuarioLogado = await usuarioModels.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuario logado nao encontrado'});
            }
            // e qual a outra informçao e onde ela vem ?
            const usuarioASerSeguido = await usuarioModels.findById(id);
            if (!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuario a ser seguido nao encontrado'})
            }
            //buscar se EU Logado sigo  ou nao esse usuario
            const euJaSigoEsseUsuario = await seguidorModels 
            .find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id})
                if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                    //sinal que eu ja sigo o usuario
                    euJaSigoEsseUsuario.forEach(async (e: any)=>
                    await seguidorModels.findByIdAndDelete({_id : e._id}))


                    //remove um seguindo no usuario logado
                    usuarioLogado.seguindo--;
                    await usuarioModels.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                    //remove um seguindo no usuario logado
                    usuarioASerSeguido.seguidores--;
                    await usuarioModels.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido)

                    return res.status(200).json({msg : 'Deixou de seguir o usuario '})

                }else{
                    //sinal que eu nao sigo o usuario
                    const seguidor = {
                        usuarioId : usuarioLogado._id,
                        usuarioSeguidoId : usuarioASerSeguido.id
                    };
                    await seguidorModels.create(seguidor)
                    //adicionar um seguindo no usuario logado
                    usuarioLogado.seguindo++;
                    //atualizando no DB
                    await usuarioModels.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado)


                    //adicionar um seguido no usuario seguido
                    usuarioASerSeguido.seguidores++;
                    //atualizando o DB
                    await usuarioModels.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido)


                    return res.status(200).json({msg : 'usuario seguido com sucesso'});
                }
        }
        return res.status(405).json({erro : 'Metodo informado nao existe'})
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({erro : 'Nao foi possivel seguir deseguir o usuario informado'});
    }
}
export default validarTokenJWT(conectarMongoDB(endpointSeguir));