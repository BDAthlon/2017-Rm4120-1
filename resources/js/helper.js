function insertMail()
{
    var action = "m"+"ailt" +"o:";
    var domain = "@" + "utah" + "." + "ed" + "u";
    var mail_leandro = "l" + "." + "wa" + "tana" + "be" + domain;
    var mail_tramy = "t" + "ra" + "my." + "ngu" + "yen" + domain;
    d3.select("#mail-leandro").attr("href",action + mail_leandro ).text(mail_leandro);
    d3.select("#mail-tramy").attr("href",action +  mail_tramy ).text(mail_tramy);
}


insertMail();