var response_formatter = async (ctx,next) => {
    await next();

    if (ctx.body){
        ctx.body = {
            code:0,
            message:'success',
            data:ctx.body
        }
    }else{
        ctx.body = {
            code:0,
            message:'error'
        }
    }
}

module.exports = response_formatter;