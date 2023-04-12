import type {NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg';
import nc from 'next-connect';
import {upload, uploadImagemCosmic} from '../../../service/uploadImagemCosmic';
import {conectarMongoDB} from '../../../middleware/conectarMongoDB';
import {validarTokenJWT} from '../../../middleware/validarTokenJWT';
import {publicacaoModels} from '../../../models/publicacaoModels';
import {usuarioModels} from '../../../models/usuarioModels';



const handler = nc ()
.use(upload.single('file'))
.post (async (req : any, res : NextApiResponse <respostaPadraoMsg>) => {  
    try {
            const {userId} = req.query;
            const usuario = await usuarioModels.findById(userId);
            if (!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado'})
            }

            if(!req || !req.body){
                return res.status(400).json({erro:'Parametros de entreda nao informados'});
            }

            const {descricao} = req?.body;
         if (!descricao || descricao.length < 2){
             return res.status(400).json({erro:'Descriçao não é valida'});
         }
         
         if (!req.file || !req.file.originalname){
            return res.status(400).json({erro:'Imagem obrigatoria'});
         }
         const image = await uploadImagemCosmic(req);
         const publicacao = {
            idUsuario : usuario._id,
            descricao,
            foto : image.media.url,
            data : new Date ()
         }

         await publicacaoModels.create(publicacao);

         return res.status(200).json({msg : 'Publicacao criada com sucesso'});


        } 
        catch (e) {
            console.log(e);
            return res.status(400).json({erro:'erro ao cadastrar publicacao'});
        }
    });

export const config = {
    api:{
        bodyParser : false
    }

}
export default validarTokenJWT(conectarMongoDB(handler));