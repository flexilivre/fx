Date.prototype.toSQL = function()
{
    let month = (this.getMonth() + 1);
    let day = this.getDate();
    let hours = this.getHours();
    let minutes = this.getMinutes();
    let secondes = this.getSeconds();
    return this.getFullYear() + "-" + ((month > 9) ? month : ("0" + month)) + "-" + ((day > 9) ? day : ("0" + day)) + " " + ((hours > 9) ? hours : ("0" + hours)) + ":" + ((minutes > 9) ? minutes : ("0" + minutes)) + ":" + ((secondes > 9) ? secondes : ("0" + secondes));
};

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };


Date.fromSQL = function(sqlDate)
{
    let t = sqlDate.split(/[- :]/);
    return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
};

Date.prototype.toString = function()
{
    let month = (this.getMonth()+1);
    return normalize(this.getDate())  + "/" + normalize(this.getMonth()+1) + "/" + this.getFullYear() + " " + normalize(this.getHours()-1) + ":" + normalize(this.getMinutes()) + ":" + normalize(this.getSeconds());
};

function normalize(num)
{
    return ((Number(num) > 9) ? num : "0" + num);
};

Date.notSameDay = function(timestamp1, timestamp2)
{
  let date1 =  new Date(parseInt(timestamp1) * 1000);
  let date2 =  new Date(parseInt(timestamp2) * 1000);
  return   date1.getFullYear() != date2.getFullYear()
        || date1.getMonth() != date2.getMonth()
        || date1.getDate() != date2.getDate();
}

Date.differentYear = function(timestamp1, timestamp2)
{
  let date1 =  new Date(parseInt(timestamp1) * 1000);
  let date2 =  new Date(parseInt(timestamp2) * 1000);
  return   date1.getFullYear() != date2.getFullYear();
}

Date.unixTimeToDate = function(UNIX_timestamp, showDate, showMonth, showYear, showHours, showMinutes, showSeconds)
{
  let a = new Date(UNIX_timestamp * 1000);
  let months = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  let year = a.getFullYear();
  let month = months[a.getMonth()];
  let date = a.getDate();
  let hour = normalize(a.getHours());
  let min = normalize(a.getMinutes());
  //let sec = a.getSeconds();
  let time = (showDate ? date : '') + ' ' + (showMonth ? month : '') + ' ' + (showYear ? year : '') + ' ' + (showHours ? hour : '') + (showMinutes ? (':' + min) : '') + (showSeconds ? (':' + a.getSeconds()) : '') ;
  return time;
};