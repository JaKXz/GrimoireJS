import RendererBase = require('../RendererBase');
import SceneObject = require('../../SceneObject');
import Material = require('../../Materials/Material');
import RenderStageBase = require('./RenderStageBase');
import TextureBase = require('./../../Resources/Texture/TextureBase');
import FBO = require('./../../Resources/FBO/FBO');
import JThreeContextProxy = require('../../JThreeContextProxy');
import FrameBufferAttachmentType = require('../../../Wrapper/FrameBufferAttachmentType');
import ClearTargetType = require("../../../Wrapper/ClearTargetType");
import TextureFormat = require('../../../Wrapper/TextureInternalFormatType');
import ElementFormat = require('../../../Wrapper/TextureType');
import TextureMinFilterType = require('../../../Wrapper/Texture/TextureMinFilterType');
import Scene = require('../../Scene');
import Program = require('../../Resources/Program/Program');
import QuadGeometry = require('../../Geometries/QuadGeometry');
import LightAccumulationMaterial = require('../../Materials/LightAccumulationMaterial');
import Mesh=require('../../../Shapes/Mesh');
import RBO = require('../../Resources/RBO/RBO');
import Matrix = require('../../../Math/Matrix');
import Vector3 = require('../../../Math/Vector3');
import Vector2 = require('../../../Math/Vector2');
import ResolvedChainInfo = require('../ResolvedChainInfo');
import PointLight = require('../../Light/PointLight');
import DirectionalLight = require('../../Light/DirectionalLight');
import agent = require('superagent');
import GLFeatureType = require("../../../Wrapper/GLFeatureType");
class LitghtAccumulationStage extends RenderStageBase
{
	private rblight:TextureBase;
	
	private rbLightFBO:FBO;
	
	private program:Program;
	
	
	private lightAccumulationMaterial:LightAccumulationMaterial;
	
	constructor(renderer:RendererBase)
	{
		super(renderer);
		var context = JThreeContextProxy.getJThreeContext();
		var width =512,height=512;
		var id = this.Renderer.ID;
		var rm = context.ResourceManager;
		this.rblight=rm.createTexture(id+".deffered.light",width,height);
		this.rbLightFBO=rm.createFBO(id+".deffered.light");
		this.rbLightFBO.getForContext(renderer.ContextManager).attachTexture(FrameBufferAttachmentType.ColorAttachment0,this.rblight);
	    var vs = require('../../Shaders/VertexShaders/PostEffectGeometries.glsl');
    agent.get("/LightAccumulation.glsl").end((err,res:agent.Response)=>{
          this.program = this.loadProgram("jthree.shaders.vertex.post", "jthree.shaders.fragment.deffered.lightaccum", "jthree.programs.deffered.light", vs,res.text);
    });
  }
	
	
	public preBeginStage(scene:Scene,passCount:number)
	{
    this.Renderer.GLContext.BindFrameBuffer(null);
    this.Renderer.GLContext.Clear(ClearTargetType.DepthBits);
    this.Renderer.GLContext.Disable(GLFeatureType.CullFace);
	}
	
	public postEndStage(scene:Scene,passCount:number)
	{
	}
	
	public render(scene:Scene,object: SceneObject,passCount:number,texs:ResolvedChainInfo) {
		var geometry = object.Geometry;
		if (!geometry) return;
		//this.rbLightFBO.getForContext(this.Renderer.ContextManager).bind();
		this.configureMaterial(scene,this.Renderer,new Mesh(geometry,this.lightAccumulationMaterial),texs);
		geometry.drawElements(this.Renderer.ContextManager);
    this.Renderer.GLContext.Flush();
		//this.rbLightFBO.getForContext(this.Renderer.ContextManager).unbind();
	}
	
	configureMaterial(scene:Scene,renderer: RendererBase, object: SceneObject,texs:ResolvedChainInfo): void {
    if(!this.program)return;
    var geometry = object.Geometry;
    var programWrapper = this.program.getForContext(renderer.ContextManager);
    programWrapper.useProgram();
    var jThreeContext = JThreeContextProxy.getJThreeContext();
    var resourceManager = jThreeContext.ResourceManager;
    var ip=Matrix.inverse(renderer.Camera.ProjectionMatrix);
    programWrapper.setAttributeVerticies("position", geometry.PositionBuffer.getForRenderer(renderer.ContextManager));
    programWrapper.setAttributeVerticies("uv", geometry.UVBuffer.getForRenderer(renderer.ContextManager));
    programWrapper.setUniformVector("c_pos", renderer.Camera.Position);
    programWrapper.setUniformVector("c_dir", renderer.Camera.LookAt.subtractWith(renderer.Camera.Position).normalizeThis());
    this.registerTexture(this.program,renderer,texs["RB1"], 0, "rb1");
    this.registerTexture(this.program,renderer,texs["RB2"], 1, "rb2");
    
    this.registerTexture(this.program,renderer,texs["DEPTH"], 2, "depth");
    //pass variables related to point lights
    var plights=scene.getLights("jthree.lights.pointlight");
    var lpos=new Array(plights.length);
    var lcol=new Array(plights.length);
    var lcoef=new Array(plights.length);
    for(var i =0; i<plights.length;i++){
      var pl=<PointLight>plights[i];
      lpos[i]=Matrix.transformPoint(renderer.Camera.ViewMatrix,plights[i].Position);
      lcol[i]=plights[i].Color.toVector().multiplyWith(pl.Intensity);
      lcoef[i]=new Vector2(pl.Decay,pl.Distance);
    }
    programWrapper.setUniformVectorArray("pl_pos",lpos);
    programWrapper.setUniformVectorArray("pl_col",lcol);
    programWrapper.setUniformVectorArray("pl_coef",lcoef);
    programWrapper.setUniform1i("pl_count",plights.length);
    //pass variables related to directional lights
    var dlights =<DirectionalLight[]> scene.getLights("jthree.lights.directionallight");
    var ddir=new Array(dlights.length);
    var dcol=new Array(dlights.length);
    for(var i=0;i<dlights.length;i++)
    {
      var dl=<DirectionalLight>dlights[i];
      ddir[i]=Matrix.transformNormal(renderer.Camera.ViewMatrix,dlights[i].Transformer.Foward);
      dcol[i]=dl.Color.toVector().multiplyWith(dl.Intensity);
    }
    programWrapper.setUniformVectorArray("dl_dir",ddir);
    programWrapper.setUniformVectorArray("dl_col",dcol);
    programWrapper.setUniform1i("dl_count",dlights.length);
    programWrapper.setUniform1f("c_near",0.1);
    programWrapper.setUniform1f("c_far",5);
    programWrapper.setUniformMatrix("matIP",ip);
    programWrapper.setUniformMatrix("matTV",Matrix.inverse(renderer.Camera.ViewMatrix));
    programWrapper.setUniformMatrix("matLV",dlights[0]?dlights[0].VP:Matrix.identity());

    this.registerTexture(this.program,renderer,resourceManager.getTexture("directional.test"),3,"u_ldepth");
    programWrapper.setUniformVector("posL",Matrix.transformPoint(renderer.Camera.ViewMatrix,new Vector3(2,0.4,-2)));
    programWrapper.setUniform1f("time",(new Date()).getMilliseconds()+1000*(new Date().getSeconds()));
    programWrapper.setUniform1f("xtest",<number>new Number((<HTMLInputElement>document.getElementsByName("x").item(0)).value));
    programWrapper.setUniform1f("ztest",<number>new Number((<HTMLInputElement>document.getElementsByName("z").item(0)).value));
    geometry.IndexBuffer.getForRenderer(renderer.ContextManager).bindBuffer();
  }

	public needRender(scene:Scene,object: SceneObject, passCount:number): boolean {
		return true;
	}
	
		public getPassCount(scene:Scene)
	{
		return 1;
	}
	
		
		public get TargetGeometry():string
	{
		return "quad";
	}
}
export = LitghtAccumulationStage;