import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg';
import type {cadastroRequisicao} from '../../../types/cadastroRequisicao';
import {usuarioModels} from '../../../models/usuarioModels';
import md5 from 'md5';
import {conectarMongoDB}from '../../../middleware/conectarMongoDB';
import {upload, uploadImagemCosmic} from '../../../service/uploadImagemCosmic';
import nc from 'next-connect';
import { error } from 'console';
import { politicaCORS } from '../../../middleware/politicaCORS';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
      try {const usuario = req.body as cadastroRequisicao;

        if(!usuario.nome || usuario.nome.length < 2){
            return res.status(400).json ({erro : 'Nome invalido'});
        }
        
        if(!usuario.email || usuario.email.length < 5
            || !usuario.email.includes ('@')
            || !usuario.email.includes ('.')){
               return res.status(400).json ({erro : 'Email invalido'});  
        }

        if(!usuario.senha || usuario.senha.length <4){
            return res.status(400).json({erro : 'Senha invalida'});
        }   
        
        // validaçao se ja existe usuario com o mesmo email
        const usuariosComMesmoEmail = await usuarioModels.find({email : usuario.email});
        if (usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0){
            return res.status(400).json({erro: 'Ja existe uma conta com o email informado'})
        }
        // enviar a imagem do multer para o cosmic
        const image = await uploadImagemCosmic(req);

        // salvar no banco de dados
        const usuarioASerSalvo = {
            nome : usuario.nome,
            email : usuario.email,
            senha : md5(usuario.senha),
            avatar: image?.media.url
            
        }

        await usuarioModels.create(usuarioASerSalvo);
        return res.status(200).json({msg: 'Usuario criado com sucesso !'})
        
      } catch (e : any) {
        console.log(e);
        return res.status(400).json({erro : error.toString()});
    }
        ;
        })
   

        export const config = {
            api: {
                bodyParser: false
            }
        }

        export default politicaCORS(conectarMongoDB(handler));    