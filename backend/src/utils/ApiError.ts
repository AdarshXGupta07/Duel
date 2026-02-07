class ApiError extends Error {
    public statusCode: number;
    public errors: any[];
    public message: string;
    public success: boolean;

    constructor(
        statusCode:number,
        message:string="something went wrong",
        errors:any=[],
        stack:string="",
    )
    {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.success = false;
        if(stack){
            this.stack = stack; 
        }
        else{
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}
export {ApiError};