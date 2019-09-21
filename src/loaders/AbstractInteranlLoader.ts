namespace pixi_compressed_textures {
    /**
     * Basic Abstrcat Loader for compressed textures
     * 
     */
    export abstract class AbstractInternalLoader {
        /**
         * Loader type 
         */
        public static type: string = "ABSTRACT";
        
        protected _format: number = 0;
        
        constructor(protected _image: CompressedImage = new CompressedImage("unknown")) {
            //@ts-ignore
            _image._internalLoader = this;
        }
        
        /**
         * Calculate buffer size form specific width/height and mip level
         * 
         * @param width texture width
         * @param height texture height
         * @param mipLevel mipLevel
         */
        public abstract levelBufferSize(width: number, height: number, mipLevel?: number): number;
        
        /**
         * Load texture from buffer
         * 
         * @param buffer 
         */
        public abstract load(buffer: ArrayBuffer): CompressedImage;
        
        /**
         * Free internals buffers
         * 
         */
        public free(): void {};

        /**
         * Test buffer header for supporting to decodings of current loader
         * 
         * @param arrayBuffer 
         */
        static test(arrayBuffer: ArrayBuffer) {
            return false;
        }
    }
}