function insertMail()
{
    var action = "m"+"ailt" +"o:";
    var domain = "@" + "utah" + "." + "ed" + "u";
    var mail_leandro = "l" + "." + "wa" + "tana" + "be" + domain;
    var mail_tramy = "t" + "ra" + "my." + "ngu" + "yen" + domain;
    var mail_meher = "m" + "eher" + "sam" + "251" + "@" + "gmail.com"
    d3.select("#mail-leandro").attr("href",action + mail_leandro ).text(mail_leandro);
    d3.select("#mail-tramy").attr("href",action +  mail_tramy ).text(mail_tramy);
    d3.select("#mail-meher").attr("href",action + mail_meher ).text(mail_meher);
}


insertMail();