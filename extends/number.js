/**
 * Returns a number that is the neirest multiple.
 * Exemple :
 * 12.multipleOf( 5 ) => 10
 * 14.multipleOf( 5 ) => 15
 */
Number.prototype.multipleOf = function(multiple)
{
    let floor = Math.floor(this / multiple) * multiple;
    let delta = this - floor;
    delta =  (delta < (multiple / 2)) ? 0 : multiple;
    return floor + delta;
};