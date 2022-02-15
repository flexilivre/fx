Point.prototype.multipleOf = function(multiple)
{
    this.x = this.x.multipleOf(multiple);
    this.y = this.y.multipleOf(multiple);
};