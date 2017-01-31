/**
 * Created by sohel on 4/15/15.
 */


module.exports = function(){

  return {
    /**
     * error handler
     * @param res
     * @param err
     * @returns {*}
     */
    validationError : function(res, err){
      return res.json(422, err);
    }
  }

};