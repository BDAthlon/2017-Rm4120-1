package dataCompiler;

import java.io.File;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.HashSet;

public class Main {

	public static void main(String[] args) 
	{
		String inDir = "/Users/tramyn/Documents/bdathlon2017/2017-Rm4120-1/resources/figs/";
		String outDir = "/Users/tramyn/Documents/";
		String outputFileName = "promoters";
		String filePath = inDir + "promoters/";
		HashSet<String> inputFiles = getFileNames(getFilesFromPath(filePath));

		int endList = inputFiles.size();
		int idVal = 0;
		String idKey = "{\"glyph__idName\": ";
		String metaIdKey = "\"glyph__metaId\": \"";

		String nameKey = "\"glyph__type\": \"";
		String glyphType = "promoter";

		/*
		 * "[
		 * {"_glyph__id":xxx", _glyph__type:yyy"},
		 * {"_glyph__id":xxx", _glyph__type:yyy"}
		 * ]
		 */
		String outputContent = "[";

		for(String file : inputFiles)
		{
			String tempId = idKey + idVal++ ;
			String metaId = metaIdKey + file + "\"";
			String tempName = nameKey + glyphType + "\"";
			String stitch = tempId + "," + metaId + "," + tempName;
			outputContent = outputContent + stitch + "}";
			endList--;
			
			if(endList == 0)
			{
				break;
			}
			else
			{
				outputContent = outputContent + ",";
			}
		}
		outputContent = outputContent + "]";
		System.out.println(outputContent);
		File f = new File(outDir + outputFileName + ".json");
		try 
		{
			FileWriter fileWriter = new FileWriter(f);
			fileWriter.write(outputContent);
			fileWriter.flush();
			fileWriter.close();
		} 
		catch (IOException e) 
		{
			e.printStackTrace();
		}
	}

	private static HashSet<String> getFileNames(HashSet<String> files)
	{
		HashSet<String> fileNames = new HashSet<String>();
		for(String f : files)
		{
			if(f.endsWith(".png"))
			{
				fileNames.add(f.replace(".png", ""));
			}
		}
		return fileNames;
	}

	public static HashSet<String> getFilesFromPath(String filePath)
	{
		HashSet<String> files = new HashSet<String>();

		//TODO: future goal, add other extensions here?
		File fileDir = new File(filePath);
		File[] glyphFiles =  fileDir.listFiles(new FilenameFilter() {
			public boolean accept(File dir, String name) {
				return (name.toLowerCase().endsWith(".png"));
			}
		});

		for(File f : glyphFiles)
		{
			files.add(f.getName());
		}
		return files;
	}

}
