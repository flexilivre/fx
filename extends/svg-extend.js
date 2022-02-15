// Get next named element id
SVG.eid = function(name) {
    return Utils.newID();//'Svgjs' + capitalize(name) + (SVG.did++)
};

SVG.extend(SVG.Base, {
    positionOf : function(child) {
        let  parent = child.parentNode;
        return Array.prototype.indexOf.call(parent.children, child);
    }
});