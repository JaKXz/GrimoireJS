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
import Mesh = require('../../../Shapes/Mesh');
import RBO = require('../../Resources/RBO/RBO');
import Matrix = require('../../../Math/Matrix');
import Vector3 = require('../../../Math/Vector3');
import Vector2 = require('../../../Math/Vector2');
import ResolvedChainInfo = require('../ResolvedChainInfo');
import PointLight = require('../../Light/PointLight');
import DirectionalLight = require('../../Light/DirectionalLight');
import agent = require('superagent');
import GLFeatureType = require("../../../Wrapper/GLFeatureType");
declare function require(name: string): any;
class LitghtAccumulationStage extends RenderStageBase {

	private rbLightFBO: FBO;

	private program: Program;

	constructor(renderer: RendererBase) {
		super(renderer);
		var context = JThreeContextProxy.getJThreeContext();
		var width = 512, height = 512;
		var id = this.Renderer.ID;
		var rm = context.ResourceManager;
		this.rbLightFBO = rm.getFBO("jthree.fbo.default");
		this.rbLightFBO.getForContext(renderer.ContextManager).attachRBO(FrameBufferAttachmentType.DepthAttachment, rm.getRBO("jthree.rbo.default"));
		var vs = require('../../Shaders/VertexShaders/PostEffectGeometries.glsl');
		agent.get("/GrayScale.glsl").end((err, res: agent.Response) => {
			this.program = this.loadProgram("jthree.shaders.vertex.post", "jthree.shaders.fragment.post.gray", "jthree.programs.post.gray", vs, res.text);
		});
	}


	public preBeginStage(scene: Scene, passCount: number, texs: ResolvedChainInfo) {
		if (texs["OUT"] == null){
			this.rbLightFBO.getForContext(this.Renderer.ContextManager).unbind();
		}
		else
			this.rbLightFBO.getForContext(this.Renderer.ContextManager).attachTexture(FrameBufferAttachmentType.ColorAttachment0,texs["OUT"]);
	}

	public postEndStage(scene: Scene, passCount: number) {
	}

	public render(scene: Scene, object: SceneObject, passCount: number, texs: ResolvedChainInfo) {
		var geometry = object.Geometry;
		if (!geometry || !this.program) return;
		this.configureMaterial(scene, this.Renderer, new Mesh(geometry, null), texs);
		geometry.drawElements(this.Renderer.ContextManager);
		this.Renderer.GLContext.Flush();
		//this.rbLightFBO.getForContext(this.Renderer.ContextManager).unbind();
	}

	configureMaterial(scene: Scene, renderer: RendererBase, object: SceneObject, texs: ResolvedChainInfo): void {
		var geometry = object.Geometry;
		var programWrapper = this.program.getForContext(renderer.ContextManager);
		programWrapper.useProgram();
		var jThreeContext = JThreeContextProxy.getJThreeContext();
		var resourceManager = jThreeContext.ResourceManager;
		var ip = Matrix.inverse(renderer.Camera.ProjectionMatrix);
		programWrapper.setAttributeVerticies("position", geometry.PositionBuffer.getForRenderer(renderer.ContextManager));
		programWrapper.setAttributeVerticies("uv", geometry.UVBuffer.getForRenderer(renderer.ContextManager));
		programWrapper.registerTexture(renderer, texs["SOURCE"], 0, "source");
	}

	public needRender(scene: Scene, object: SceneObject, passCount: number): boolean {
		return true;
	}

	public getPassCount(scene: Scene) {
		return 1;
	}


	public get TargetGeometry(): string {
		return "quad";
	}
}
export = LitghtAccumulationStage;