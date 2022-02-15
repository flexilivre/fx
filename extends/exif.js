!function(){
    /* Exif 0x0112	Orientation
     1 = Horizontal (normal)
     2 = Mirror horizontal
     3 = Rotate 180
     4 = Mirror vertical
     5 = Mirror horizontal and rotate 270 CW
     6 = Rotate 90 CW
     7 = Mirror horizontal and rotate 90 CW
     8 = Rotate 270 CW
     */
    window.Exif = {
        getDateTaken : function(exif)
        {
            let date;

            if (exif)
            {
                exif = exif.getAll().Exif;
                let data = exif ? exif.DateTimeOriginal : null;

                //let data = exif.get('DateTimeOriginal');
                if (!data && exif && exif.DateTimeDigitized)
                    data = exif.DateTimeDigitized; //exif.get('DateTimeDigitized');

                if (!data && exif && exif.DateTime)
                    data = exif.DateTime;//exif.get('DateTime');

                if (typeof data == "string")
                {
                    let parts = data.split(" ");
                    if (parts[0] && parts[1])
                    {
                        let dateParts = parts[0].split(":"); 
                        let timeParts = parts[1].split(":"); 
                        date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]) );
                    }
                }  
            }

            if (!date)
                date = new Date();

            return date;
        },
        getOrientationAngle : function(exif)
        {
          if (!exif)
            return 0;
          else
          {
              let orientation = exif.get('Orientation');
              switch(orientation)
              {
                  case 6 :
                      orientation = 90;
                      break;
                  case 8 :
                      orientation = 270;
                      break;
                  case 3 :
                      orientation = 180;
                      break;
                  default:
                      orientation = 0;
              }
              return orientation;
          }
        }
    };

}();
