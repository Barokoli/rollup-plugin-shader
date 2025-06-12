declare module 'rollup-plugin-shader' {
    function shader(options?: { include?: string | string[], exclude?: string, removeComments: boolean, singleFuncMode?: boolean }): any
    export default shader
}

declare module '*.glsl' {
    export const innerCircle = ""
}
