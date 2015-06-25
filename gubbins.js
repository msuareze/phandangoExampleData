// james hadfield / WTSI
// mostly written by simon harris / WTSI

function parse_gubbins() {
	var myState = this;
	var lines = return_gubbins_gff().split("\n")
	var data_start=0;
	var data_end=0;
    var gubbins_data=[];
    var reference_data=[];

	for (i=0; i<lines.length; i++){
	    var words=lines[i].split("\t");
	    if (words[0][0]=="#"){
	    	var hwords=words[0].split(" ");
	    	if (hwords[0]=="##sequence-region") {
	    		data_start=parseInt(hwords[2])-1;
	    		data_end=parseInt(hwords[3]);
	    	}
	    }
	    else {
	    	if (words[1]=="GUBBINS"){
	    		var taxa = lines[i].split("taxa=\"")[1].split("\"")[0].split(/\s+/).filter(Boolean)

	    		gubbins_data.push([parseInt(words[3]),parseInt(words[4]), "red", 0.7, "red", 0, words[8], taxa])
	    	}
	    	else if (words[1]=="EMBL"){
	    		if (words[2]=="CDS"){
	    			reference_data.push([parseInt(words[3]),parseInt(words[4]), words[6], "#318DCC", "black", 1, words[8]])
	    		}
	    		else if (words[2]=="tRNA"){
	    			reference_data.push([parseInt(words[3]),parseInt(words[4]), words[6], "#53FFE9", "black", 1, words[8]])
	    		}
	    		else if (words[2]=="rRNA"){
	    			reference_data.push([parseInt(words[3]),parseInt(words[4]), words[6], "#6F8899", "black", 1, words[8]])
	    		}
	    	}
	  	}
	 }

	 this.start=data_start;
	 this.end=data_end;
	 genomelength=data_end-data_start;
	 // xscalingfactor=canvaslength/(end-start)
	 if (gubbins_data.length>0) {
	 	recombinations=gubbins_data;

	 	myState.blocks_by_id = []
		 myState.blocks = [];
		 for(recombinationnum = 0; recombinationnum < recombinations.length; recombinationnum++) {
			myState.blocks.push(new Block(recombinations[recombinationnum][0], recombinations[recombinationnum][1], recombinations[recombinationnum][2], recombinations[recombinationnum][3], recombinations[recombinationnum][4], recombinations[recombinationnum][5], recombinations[recombinationnum][6]));

			for (taxanum=0; taxanum<recombinations[recombinationnum][7].length; taxanum++) {

				myState.blocks_by_id.push(new Block(recombinations[recombinationnum][0], recombinations[recombinationnum][1], recombinations[recombinationnum][2], recombinations[recombinationnum][3], recombinations[recombinationnum][4], recombinations[recombinationnum][5], recombinations[recombinationnum][6], recombinations[recombinationnum][7][taxanum]));
			}


		 }

		 heatmap_blocks=ConvertBlockstoHeat(recombinations);
		 myState.heatblocks = [];
		 for(recombinationnum = 0; recombinationnum < heatmap_blocks.length; recombinationnum++) {
			myState.heatblocks.push(new Block(heatmap_blocks[recombinationnum][0],heatmap_blocks[recombinationnum][1],heatmap_blocks[recombinationnum][2]));

		}
		myState.depths=calculateBlockDepthPlot(myState.blocks);
	myState.valid = false;
	}

	if (reference_data.length>0) {

		 myState.arrows = [];
		 for(recombinationnum = 0; recombinationnum < reference_data.length; recombinationnum++) {
			myState.arrows.push(new Arrow(reference_data[recombinationnum][0], reference_data[recombinationnum][1], reference_data[recombinationnum][2], reference_data[recombinationnum][3], reference_data[recombinationnum][4], reference_data[recombinationnum][5], reference_data[recombinationnum][6]));
			myState.valid = false;
		 }
	myState.valid = false;
	}
}




function sortarrayofarraysNumber(a,b)
	{
		return a[0] - b[0];
	}


function rgbToHex(R,G,B) {return "#"+toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
	 n = parseInt(n,10);
	 if (isNaN(n)) return "00";
	 n = Math.max(0,Math.min(n,255));
	 return "0123456789ABCDEF".charAt((n-n%16)/16)
	      + "0123456789ABCDEF".charAt(n%16);
	}


function ConvertBlockstoHeat(myblocks){

	var sort_order=[];

	for (i=0; i<myblocks.length; i++){

		sort_order.push([myblocks[i][0], 0, i]);
		sort_order.push([myblocks[i][1], 1, i]);

	}

	sort_order=sort_order.sort(sortarrayofarraysNumber);

	var heatblocks=[];
	var heat_depth=0;
	var blockstart=0;
	var maxdepth=0;

	for (i=0; i<sort_order.length; i++){


		if (heat_depth>0) {
			heatblocks.push([blockstart, sort_order[i][0], heat_depth])
		}


		if (sort_order[i][1]==0){

			heat_depth+=1

			if (heat_depth>maxdepth){
				maxdepth=heat_depth;
			}

			blockstart=sort_order[i][0]

		}
		else if (sort_order[i][1]==1){

			heat_depth-=1
			blockstart=sort_order[i][0]

		}

	}


	for (i=0; i<heatblocks.length; i++){
		var depth=heatblocks[i][2];
		heatblocks[i].splice(2,1);
		heatblocks[i].push(rgbToHex(((depth-1)/(maxdepth-1))*255,0,255-(((depth-1)/(maxdepth-1))*255)))
	}



	return heatblocks;

}



function calculateBlockDepthPlot(myblocks){

	var sort_order=[];

	for (i=0; i<myblocks.length; i++){

		sort_order.push([myblocks[i].featurestart, 0, i]);
		sort_order.push([myblocks[i].featureend, 1, i]);

	}

	sort_order=sort_order.sort(sortarrayofarraysNumber);

	var drawpoints=[];
	var depth=0;

	drawpoints.push([0, depth])

	for (i=0; i<sort_order.length; i++){

		drawpoints.push([sort_order[i][0], depth])
		if (sort_order[i][1]==0){

			depth+=1;


		}
		else if (sort_order[i][1]==1){

			depth-=1;

		}

		drawpoints.push([sort_order[i][0], depth])

	}

	drawpoints.push([genomelength, depth])

	return drawpoints;


}

function drawBlockDepthPlot(ctx, drawpoints){


	var maxdepth=0;
	var plotheight=50
	ctx.strokeStyle = "black";
	ctx.fillStyle = "black";
	ctx.lineWidth = 1;
	ctx.beginPath();
	var startval=0;
	var endval=0;

	for (i=0; i<drawpoints.length; i++){

		if (((drawpoints[i][0])>=start) && (drawpoints[i][0]<=end)){

			if (drawpoints[i][1]>maxdepth) {
				maxdepth=drawpoints[i][1];
			}
		}
		else if (drawpoints[i][0]<start){
			if (i+1<drawpoints.length){
				startval=drawpoints[i+1][1];
			}
		}

	}

	ctx.moveTo(canvasstart, 300);
	ctx.lineTo(canvasstart, 300-((startval/maxdepth)*plotheight));

	for (i=0; i<drawpoints.length; i++){

		if (((drawpoints[i][0])>=start) && (drawpoints[i][0]<=end)){

			ctx.lineTo((xscalingfactor*(drawpoints[i][0]-start))+canvasstart, 300-((drawpoints[i][1]/maxdepth)*plotheight));
			endval=drawpoints[i][1];
		}

	}

	if (endval!=0){
		ctx.lineTo(canvasend, 300-((endval/maxdepth)*plotheight));
	}
	ctx.lineTo(canvasend, 300);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(canvasstart, 300);
	ctx.lineTo(canvasstart, 300-plotheight);
	ctx.lineTo(canvasstart-2, 300-plotheight);
	ctx.stroke();
	ctx.save();
	ctx.translate( canvasstart+2, 300-plotheight);
	ctx.textAlign = "left";
	ctx.textBaseline="middle";
	ctx.font="12px Helvetica";
		ctx.fillText(String(maxdepth), 0, 0);
	ctx.restore();



}












function return_gubbins_gff() {
	var gff_string = "##gff-version 3\n##sequence-region SEQUENCE 1 3503610\nSEQUENCE	GUBBINS	CDS	3310617	3319330	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"3168.930135\"taxa=\"ST1_8\";snp_count=\"224\"\nSEQUENCE	GUBBINS	CDS	2994178	3006241	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"2563.109260\"taxa=\"ST1_8\";snp_count=\"118\"\nSEQUENCE	GUBBINS	CDS	3162890	3194513	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"2137.409930\"taxa=\"ST1_8\";snp_count=\"128\"\nSEQUENCE	GUBBINS	CDS	2954911	2963935	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"1647.677130\"taxa=\"ST1_8\";snp_count=\"86\"\nSEQUENCE	GUBBINS	CDS	3091916	3106059	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"1301.390407\"taxa=\"ST1_8\";snp_count=\"92\"\nSEQUENCE	GUBBINS	CDS	3228756	3249903	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"930.449542\"taxa=\"ST1_8\";snp_count=\"89\"\nSEQUENCE	GUBBINS	CDS	3422165	3423998	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"554.749139\"taxa=\"ST1_8\";snp_count=\"51\"\nSEQUENCE	GUBBINS	CDS	2520359	2529673	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"319.028263\"taxa=\"ST1_8\";snp_count=\"62\"\nSEQUENCE	GUBBINS	CDS	3149042	3155746	0.000	.	0	node=\"N3->ST1_8\";neg_log_likelihood=\"107.621978\"taxa=\"ST1_8\";snp_count=\"21\"\nSEQUENCE	GUBBINS	CDS	915120	955337	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"3428.168037\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"1159\"\nSEQUENCE	GUBBINS	CDS	6516	34195	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"918.665765\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"194\"\nSEQUENCE	GUBBINS	CDS	2895018	2895040	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"383.462817\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	404935	406960	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"343.956768\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	136636	150768	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"303.808601\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"19\"\nSEQUENCE	GUBBINS	CDS	607809	619627	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"226.620379\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"10\"\nSEQUENCE	GUBBINS	CDS	642420	643590	0.000	.	0	node=\"N3->N4\";neg_log_likelihood=\"178.590930\"taxa=\" ST5_2  ST5_1 ST5_3\";snp_count=\"6\"\nSEQUENCE	GUBBINS	CDS	2005018	2027320	0.000	.	0	node=\"N11->ST1_30\";neg_log_likelihood=\"2999.977871\"taxa=\"ST1_30\";snp_count=\"307\"\nSEQUENCE	GUBBINS	CDS	2074251	2094482	0.000	.	0	node=\"N11->ST1_30\";neg_log_likelihood=\"2028.684167\"taxa=\"ST1_30\";snp_count=\"187\"\nSEQUENCE	GUBBINS	CDS	1981331	1994633	0.000	.	0	node=\"N11->ST1_30\";neg_log_likelihood=\"1293.821546\"taxa=\"ST1_30\";snp_count=\"157\"\nSEQUENCE	GUBBINS	CDS	1921849	1928683	0.000	.	0	node=\"N11->ST1_30\";neg_log_likelihood=\"647.838402\"taxa=\"ST1_30\";snp_count=\"123\"\nSEQUENCE	GUBBINS	CDS	2144221	2147242	0.000	.	0	node=\"N11->ST1_30\";neg_log_likelihood=\"205.715896\"taxa=\"ST1_30\";snp_count=\"62\"\nSEQUENCE	GUBBINS	CDS	2959733	2968259	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"3507.733465\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"460\"\nSEQUENCE	GUBBINS	CDS	1164139	1194956	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"1733.558732\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"411\"\nSEQUENCE	GUBBINS	CDS	926478	932256	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"804.562866\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"143\"\nSEQUENCE	GUBBINS	CDS	648716	650067	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"384.352981\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"47\"\nSEQUENCE	GUBBINS	CDS	1992861	1998859	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"220.426834\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"33\"\nSEQUENCE	GUBBINS	CDS	192080	192110	0.000	.	0	node=\"N11->N12\";neg_log_likelihood=\"79.038325\"taxa=\"  ST1_54 ST1_50 ST1_49\";snp_count=\"12\"\nSEQUENCE	GUBBINS	CDS	1994399	2004662	0.000	.	0	node=\"N10->N11\";neg_log_likelihood=\"811.184572\"taxa=\" ST1_30   ST1_54 ST1_50 ST1_49\";snp_count=\"445\"\nSEQUENCE	GUBBINS	CDS	190502	190530	0.000	.	0	node=\"N15->ST1_17\";neg_log_likelihood=\"44.715039\"taxa=\"ST1_17\";snp_count=\"11\"\nSEQUENCE	GUBBINS	CDS	3061410	3069294	0.000	.	0	node=\"N8->N16\";neg_log_likelihood=\"202.303529\"taxa=\" ST1_15 ST1_3\";snp_count=\"64\"\nSEQUENCE	GUBBINS	CDS	190429	190457	0.000	.	0	node=\"N25->N26\";neg_log_likelihood=\"67.697081\"taxa=\" ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41\";snp_count=\"12\"\nSEQUENCE	GUBBINS	CDS	3164825	3184005	0.000	.	0	node=\"N32->ID_1828_BC10\";neg_log_likelihood=\"470.928717\"taxa=\"ID_1828_BC10\";snp_count=\"47\"\nSEQUENCE	GUBBINS	CDS	797766	800816	0.000	.	0	node=\"N32->ID_1828_BC10\";neg_log_likelihood=\"299.935724\"taxa=\"ID_1828_BC10\";snp_count=\"14\"\nSEQUENCE	GUBBINS	CDS	2005067	2006726	0.000	.	0	node=\"N32->ID_1828_BC10\";neg_log_likelihood=\"239.020984\"taxa=\"ID_1828_BC10\";snp_count=\"10\"\nSEQUENCE	GUBBINS	CDS	3164330	3184696	0.000	.	0	node=\"N31->N32\";neg_log_likelihood=\"3107.209835\"taxa=\" ST1_57 ID_1828_BC10\";snp_count=\"417\"\nSEQUENCE	GUBBINS	CDS	2002018	2040992	0.000	.	0	node=\"N31->N32\";neg_log_likelihood=\"1635.875663\"taxa=\" ST1_57 ID_1828_BC10\";snp_count=\"371\"\nSEQUENCE	GUBBINS	CDS	795565	800955	0.000	.	0	node=\"N31->N32\";neg_log_likelihood=\"505.547551\"taxa=\" ST1_57 ID_1828_BC10\";snp_count=\"94\"\nSEQUENCE	GUBBINS	CDS	855034	857001	0.000	.	0	node=\"N31->N32\";neg_log_likelihood=\"178.761527\"taxa=\" ST1_57 ID_1828_BC10\";snp_count=\"42\"\nSEQUENCE	GUBBINS	CDS	823882	833348	0.000	.	0	node=\"N31->N32\";neg_log_likelihood=\"70.810606\"taxa=\" ST1_57 ID_1828_BC10\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	1997091	2010965	0.000	.	0	node=\"N31->N33\";neg_log_likelihood=\"656.769015\"taxa=\"  ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59\";snp_count=\"314\"\nSEQUENCE	GUBBINS	CDS	392896	420410	0.000	.	0	node=\"N24->N25\";neg_log_likelihood=\"3507.203656\"taxa=\" ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41\";snp_count=\"1025\"\nSEQUENCE	GUBBINS	CDS	1981678	2013225	0.000	.	0	node=\"N24->N25\";neg_log_likelihood=\"902.898225\"taxa=\" ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41\";snp_count=\"370\"\nSEQUENCE	GUBBINS	CDS	1983181	1997072	0.000	.	0	node=\"N24->N31\";neg_log_likelihood=\"224.925085\"taxa=\"  ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59\";snp_count=\"80\"\nSEQUENCE	GUBBINS	CDS	299130	309007	0.000	.	0	node=\"N42->N43\";neg_log_likelihood=\"1786.965050\"taxa=\"   ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46\";snp_count=\"338\"\nSEQUENCE	GUBBINS	CDS	2422757	2427342	0.000	.	0	node=\"N42->N43\";neg_log_likelihood=\"864.728624\"taxa=\"   ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46\";snp_count=\"124\"\nSEQUENCE	GUBBINS	CDS	915641	928057	0.000	.	0	node=\"N42->N43\";neg_log_likelihood=\"365.663664\"taxa=\"   ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46\";snp_count=\"111\"\nSEQUENCE	GUBBINS	CDS	1682116	1811526	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"13280.869553\"taxa=\"ST1_36\";snp_count=\"1962\"\nSEQUENCE	GUBBINS	CDS	1078977	1114651	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"7925.173162\"taxa=\"ST1_36\";snp_count=\"879\"\nSEQUENCE	GUBBINS	CDS	1814012	1852771	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"5430.829009\"taxa=\"ST1_36\";snp_count=\"604\"\nSEQUENCE	GUBBINS	CDS	1040800	1070969	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"3288.374107\"taxa=\"ST1_36\";snp_count=\"539\"\nSEQUENCE	GUBBINS	CDS	2895221	2902683	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"1740.931655\"taxa=\"ST1_36\";snp_count=\"196\"\nSEQUENCE	GUBBINS	CDS	2526748	2530864	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"1175.739904\"taxa=\"ST1_36\";snp_count=\"86\"\nSEQUENCE	GUBBINS	CDS	922796	929825	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"832.516282\"taxa=\"ST1_36\";snp_count=\"84\"\nSEQUENCE	GUBBINS	CDS	1653633	1658370	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"512.268820\"taxa=\"ST1_36\";snp_count=\"57\"\nSEQUENCE	GUBBINS	CDS	529824	535837	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"320.321512\"taxa=\"ST1_36\";snp_count=\"29\"\nSEQUENCE	GUBBINS	CDS	386193	396154	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"225.179635\"taxa=\"ST1_36\";snp_count=\"10\"\nSEQUENCE	GUBBINS	CDS	369282	373337	0.000	.	0	node=\"N42->ST1_36\";neg_log_likelihood=\"178.468291\"taxa=\"ST1_36\";snp_count=\"7\"\nSEQUENCE	GUBBINS	CDS	3380081	3395276	0.000	.	0	node=\"N51->ST1_13\";neg_log_likelihood=\"893.910288\"taxa=\"ST1_13\";snp_count=\"473\"\nSEQUENCE	GUBBINS	CDS	2860553	2909359	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"17000.965367\"taxa=\"ST1_28\";snp_count=\"1663\"\nSEQUENCE	GUBBINS	CDS	2966569	2988686	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"12681.992826\"taxa=\"ST1_28\";snp_count=\"934\"\nSEQUENCE	GUBBINS	CDS	271865	291538	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"9862.302175\"taxa=\"ST1_28\";snp_count=\"824\"\nSEQUENCE	GUBBINS	CDS	351098	365245	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"7888.282361\"taxa=\"ST1_28\";snp_count=\"477\"\nSEQUENCE	GUBBINS	CDS	591359	610326	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"6375.115698\"taxa=\"ST1_28\";snp_count=\"475\"\nSEQUENCE	GUBBINS	CDS	3387578	3396011	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"4804.731615\"taxa=\"ST1_28\";snp_count=\"366\"\nSEQUENCE	GUBBINS	CDS	2918024	2927687	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"3715.144553\"taxa=\"ST1_28\";snp_count=\"274\"\nSEQUENCE	GUBBINS	CDS	254646	262413	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"2719.201560\"taxa=\"ST1_28\";snp_count=\"253\"\nSEQUENCE	GUBBINS	CDS	2939203	2945769	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"1917.403410\"taxa=\"ST1_28\";snp_count=\"170\"\nSEQUENCE	GUBBINS	CDS	95817	105285	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"1253.437494\"taxa=\"ST1_28\";snp_count=\"168\"\nSEQUENCE	GUBBINS	CDS	1465283	1470416	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"556.420760\"taxa=\"ST1_28\";snp_count=\"135\"\nSEQUENCE	GUBBINS	CDS	787084	789218	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"221.483605\"taxa=\"ST1_28\";snp_count=\"25\"\nSEQUENCE	GUBBINS	CDS	28886	30371	0.000	.	0	node=\"N50->ST1_28\";neg_log_likelihood=\"133.895249\"taxa=\"ST1_28\";snp_count=\"11\"\nSEQUENCE	GUBBINS	CDS	1981994	2008857	0.000	.	0	node=\"N49->ST1_12\";neg_log_likelihood=\"889.808864\"taxa=\"ST1_12\";snp_count=\"377\"\nSEQUENCE	GUBBINS	CDS	256074	264516	0.000	.	0	node=\"N49->N50\";neg_log_likelihood=\"1604.523572\"taxa=\" ST1_28  ST72_1 ST1_13\";snp_count=\"188\"\nSEQUENCE	GUBBINS	CDS	1983181	2015013	0.000	.	0	node=\"N49->N50\";neg_log_likelihood=\"896.338266\"taxa=\" ST1_28  ST72_1 ST1_13\";snp_count=\"189\"\nSEQUENCE	GUBBINS	CDS	3393726	3395209	0.000	.	0	node=\"N49->N50\";neg_log_likelihood=\"156.458131\"taxa=\" ST1_28  ST72_1 ST1_13\";snp_count=\"73\"\nSEQUENCE	GUBBINS	CDS	858081	933217	0.000	.	0	node=\"N48->ST7_1\";neg_log_likelihood=\"4992.387441\"taxa=\"ST7_1\";snp_count=\"1232\"\nSEQUENCE	GUBBINS	CDS	791380	807526	0.000	.	0	node=\"N48->ST7_1\";neg_log_likelihood=\"1931.741072\"taxa=\"ST7_1\";snp_count=\"239\"\nSEQUENCE	GUBBINS	CDS	1983559	2010965	0.000	.	0	node=\"N48->ST7_1\";neg_log_likelihood=\"941.376883\"taxa=\"ST7_1\";snp_count=\"248\"\nSEQUENCE	GUBBINS	CDS	2484447	2490279	0.000	.	0	node=\"N48->ST7_1\";neg_log_likelihood=\"218.607645\"taxa=\"ST7_1\";snp_count=\"33\"\nSEQUENCE	GUBBINS	CDS	2002018	2010488	0.000	.	0	node=\"N48->N49\";neg_log_likelihood=\"124.099851\"taxa=\" ST1_12  ST1_28  ST72_1 ST1_13\";snp_count=\"36\"\nSEQUENCE	GUBBINS	CDS	1981457	2018046	0.000	.	0	node=\"N41->N42\";neg_log_likelihood=\"5794.827929\"taxa=\"    ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36\";snp_count=\"626\"\nSEQUENCE	GUBBINS	CDS	917563	929335	0.000	.	0	node=\"N41->N42\";neg_log_likelihood=\"3895.389469\"taxa=\"    ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36\";snp_count=\"332\"\nSEQUENCE	GUBBINS	CDS	843689	861966	0.000	.	0	node=\"N41->N42\";neg_log_likelihood=\"2683.308964\"taxa=\"    ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36\";snp_count=\"347\"\nSEQUENCE	GUBBINS	CDS	877964	891092	0.000	.	0	node=\"N41->N42\";neg_log_likelihood=\"1529.195743\"taxa=\"    ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36\";snp_count=\"224\"\nSEQUENCE	GUBBINS	CDS	2091402	2104212	0.000	.	0	node=\"N41->N42\";neg_log_likelihood=\"534.745233\"taxa=\"    ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36\";snp_count=\"214\"\nSEQUENCE	GUBBINS	CDS	1997105	2001806	0.000	.	0	node=\"N22->N23\";neg_log_likelihood=\"135.043186\"taxa=\"   ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13\";snp_count=\"55\"\nSEQUENCE	GUBBINS	CDS	1981424	2035681	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"5920.767635\"taxa=\"ST1_48\";snp_count=\"904\"\nSEQUENCE	GUBBINS	CDS	2365816	2377087	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"3209.547452\"taxa=\"ST1_48\";snp_count=\"397\"\nSEQUENCE	GUBBINS	CDS	2294421	2307736	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"2057.454679\"taxa=\"ST1_48\";snp_count=\"245\"\nSEQUENCE	GUBBINS	CDS	1911568	1921849	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"1033.819914\"taxa=\"ST1_48\";snp_count=\"234\"\nSEQUENCE	GUBBINS	CDS	2956323	2965649	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"445.108896\"taxa=\"ST1_48\";snp_count=\"53\"\nSEQUENCE	GUBBINS	CDS	2884279	2907327	0.000	.	0	node=\"N22->ST1_48\";neg_log_likelihood=\"258.314709\"taxa=\"ST1_48\";snp_count=\"29\"\nSEQUENCE	GUBBINS	CDS	942922	944078	0.000	.	0	node=\"N19->N20\";neg_log_likelihood=\"72.327112\"taxa=\" ID_891_BC5  ID_598_BC4 ID_2947_BC18\";snp_count=\"22\"\nSEQUENCE	GUBBINS	CDS	1983181	2010965	0.000	.	0	node=\"N19->N22\";neg_log_likelihood=\"790.534260\"taxa=\"    ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48\";snp_count=\"334\"\nSEQUENCE	GUBBINS	CDS	2319666	2324386	0.000	.	0	node=\"N7->N17\";neg_log_likelihood=\"581.676531\"taxa=\"  ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48\";snp_count=\"97\"\nSEQUENCE	GUBBINS	CDS	2014953	2018845	0.000	.	0	node=\"N7->N17\";neg_log_likelihood=\"180.183844\"taxa=\"  ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48\";snp_count=\"69\"\nSEQUENCE	GUBBINS	CDS	75660	76221	0.000	.	0	node=\"N6->N7\";neg_log_likelihood=\"116.830841\"taxa=\"     ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48\";snp_count=\"41\"\nSEQUENCE	GUBBINS	CDS	3071565	3142243	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"1889.251370\"taxa=\"ID_2948_BC19\";snp_count=\"425\"\nSEQUENCE	GUBBINS	CDS	2972971	2993161	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"650.005178\"taxa=\"ID_2948_BC19\";snp_count=\"69\"\nSEQUENCE	GUBBINS	CDS	3003881	3016674	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"413.312867\"taxa=\"ID_2948_BC19\";snp_count=\"28\"\nSEQUENCE	GUBBINS	CDS	3260124	3272911	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"281.170307\"taxa=\"ID_2948_BC19\";snp_count=\"25\"\nSEQUENCE	GUBBINS	CDS	150306	157405	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"191.407058\"taxa=\"ID_2948_BC19\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	2928006	2929589	0.000	.	0	node=\"N6->ID_2948_BC19\";neg_log_likelihood=\"151.030008\"taxa=\"ID_2948_BC19\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	2852226	2943974	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"12720.919577\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"1074\"\nSEQUENCE	GUBBINS	CDS	2125861	2148867	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"9641.642591\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"524\"\nSEQUENCE	GUBBINS	CDS	2964210	2994118	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"8006.688531\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"532\"\nSEQUENCE	GUBBINS	CDS	401143	432534	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"6428.198714\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"407\"\nSEQUENCE	GUBBINS	CDS	1986118	2005626	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"5172.720434\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"282\"\nSEQUENCE	GUBBINS	CDS	1315589	1341685	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"4235.516065\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"271\"\nSEQUENCE	GUBBINS	CDS	2795306	2817256	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"3295.542888\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"233\"\nSEQUENCE	GUBBINS	CDS	1843392	1853272	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"2570.360503\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"119\"\nSEQUENCE	GUBBINS	CDS	3017846	3052614	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"2089.292988\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"177\"\nSEQUENCE	GUBBINS	CDS	2428004	2439942	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"1424.427876\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"116\"\nSEQUENCE	GUBBINS	CDS	1509886	1513332	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"1027.858182\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"58\"\nSEQUENCE	GUBBINS	CDS	1871371	1880112	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"823.520385\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"48\"\nSEQUENCE	GUBBINS	CDS	2945415	2950814	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"620.609547\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"40\"\nSEQUENCE	GUBBINS	CDS	1972681	1976119	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"451.561392\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"32\"\nSEQUENCE	GUBBINS	CDS	1589801	1595969	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"334.503818\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"21\"\nSEQUENCE	GUBBINS	CDS	437938	443814	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"238.693989\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"18\"\nSEQUENCE	GUBBINS	CDS	2617972	2620919	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"156.846745\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"13\"\nSEQUENCE	GUBBINS	CDS	2518655	2518982	0.000	.	0	node=\"N2->N3\";neg_log_likelihood=\"95.690404\"taxa=\" ST1_8  ST5_2  ST5_1 ST5_3\";snp_count=\"8\"\nSEQUENCE	GUBBINS	CDS	1994399	2001091	0.000	.	0	node=\"N2->N6\";neg_log_likelihood=\"1127.613254\"taxa=\"      ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"307\"\nSEQUENCE	GUBBINS	CDS	68053	74429	0.000	.	0	node=\"N2->N6\";neg_log_likelihood=\"266.849433\"taxa=\"      ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"118\"\nSEQUENCE	GUBBINS	CDS	1060915	1114436	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"14537.421768\"taxa=\"ST1_58\";snp_count=\"860\"\nSEQUENCE	GUBBINS	CDS	2392732	2421895	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"12006.332695\"taxa=\"ST1_58\";snp_count=\"615\"\nSEQUENCE	GUBBINS	CDS	993110	1038854	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"10306.284225\"taxa=\"ST1_58\";snp_count=\"638\"\nSEQUENCE	GUBBINS	CDS	298539	314989	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"8308.337955\"taxa=\"ST1_58\";snp_count=\"460\"\nSEQUENCE	GUBBINS	CDS	1989289	2017240	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"6921.179551\"taxa=\"ST1_58\";snp_count=\"451\"\nSEQUENCE	GUBBINS	CDS	3363756	3413651	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"5432.273131\"taxa=\"ST1_58\";snp_count=\"493\"\nSEQUENCE	GUBBINS	CDS	1802571	1857618	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"3757.942916\"taxa=\"ST1_58\";snp_count=\"452\"\nSEQUENCE	GUBBINS	CDS	2530045	2549526	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"2142.983741\"taxa=\"ST1_58\";snp_count=\"317\"\nSEQUENCE	GUBBINS	CDS	2280942	2293075	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"1091.107633\"taxa=\"ST1_58\";snp_count=\"188\"\nSEQUENCE	GUBBINS	CDS	832911	837701	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"582.234468\"taxa=\"ST1_58\";snp_count=\"45\"\nSEQUENCE	GUBBINS	CDS	2220837	2224037	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"407.489695\"taxa=\"ST1_58\";snp_count=\"30\"\nSEQUENCE	GUBBINS	CDS	3457154	3457924	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"280.318146\"taxa=\"ST1_58\";snp_count=\"20\"\nSEQUENCE	GUBBINS	CDS	1982357	1983159	0.000	.	0	node=\"N61->ST1_58\";neg_log_likelihood=\"207.701426\"taxa=\"ST1_58\";snp_count=\"12\"\nSEQUENCE	GUBBINS	CDS	838377	919389	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"11245.042920\"taxa=\"ST152_1\";snp_count=\"1362\"\nSEQUENCE	GUBBINS	CDS	3049179	3101539	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"7205.791054\"taxa=\"ST152_1\";snp_count=\"975\"\nSEQUENCE	GUBBINS	CDS	137388	167272	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"4227.719185\"taxa=\"ST152_1\";snp_count=\"619\"\nSEQUENCE	GUBBINS	CDS	392607	414711	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"2365.138690\"taxa=\"ST152_1\";snp_count=\"345\"\nSEQUENCE	GUBBINS	CDS	351708	382225	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"1414.384582\"taxa=\"ST152_1\";snp_count=\"147\"\nSEQUENCE	GUBBINS	CDS	23516	27518	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"856.723941\"taxa=\"ST152_1\";snp_count=\"74\"\nSEQUENCE	GUBBINS	CDS	1915110	1916841	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"625.102023\"taxa=\"ST152_1\";snp_count=\"32\"\nSEQUENCE	GUBBINS	CDS	421687	432143	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"502.429574\"taxa=\"ST152_1\";snp_count=\"33\"\nSEQUENCE	GUBBINS	CDS	1988831	1990398	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"373.122418\"taxa=\"ST152_1\";snp_count=\"15\"\nSEQUENCE	GUBBINS	CDS	68804	69392	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"319.885268\"taxa=\"ST152_1\";snp_count=\"7\"\nSEQUENCE	GUBBINS	CDS	110845	113854	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"286.427784\"taxa=\"ST152_1\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	699197	699401	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"246.729085\"taxa=\"ST152_1\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	383284	391290	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"223.387859\"taxa=\"ST152_1\";snp_count=\"8\"\nSEQUENCE	GUBBINS	CDS	440235	445176	0.000	.	0	node=\"N61->ST152_1\";neg_log_likelihood=\"186.186966\"taxa=\"ST152_1\";snp_count=\"6\"\nSEQUENCE	GUBBINS	CDS	2661627	2724645	0.000	.	0	node=\"N53->N54\";neg_log_likelihood=\"20834.582943\"taxa=\" ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4\";snp_count=\"4005\"\nSEQUENCE	GUBBINS	CDS	1160175	1203349	0.000	.	0	node=\"N53->N54\";neg_log_likelihood=\"11456.451546\"taxa=\" ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4\";snp_count=\"2125\"\nSEQUENCE	GUBBINS	CDS	182787	219994	0.000	.	0	node=\"N53->N54\";neg_log_likelihood=\"4921.552021\"taxa=\" ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4\";snp_count=\"1810\"\nSEQUENCE	GUBBINS	CDS	1981851	2025625	0.000	.	0	node=\"N53->N54\";neg_log_likelihood=\"1387.931393\"taxa=\" ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4\";snp_count=\"448\"\nSEQUENCE	GUBBINS	CDS	1454845	1458138	0.000	.	0	node=\"N53->N54\";neg_log_likelihood=\"175.576211\"taxa=\" ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4\";snp_count=\"47\"\nSEQUENCE	GUBBINS	CDS	68053	76221	0.000	.	0	node=\"N53->N61\";neg_log_likelihood=\"548.264381\"taxa=\" ST1_58 ST152_1\";snp_count=\"153\"\nSEQUENCE	GUBBINS	CDS	1205044	1211176	0.000	.	0	node=\"N53->N61\";neg_log_likelihood=\"160.511867\"taxa=\" ST1_58 ST152_1\";snp_count=\"25\"\nSEQUENCE	GUBBINS	CDS	1173705	1174071	0.000	.	0	node=\"N53->N61\";neg_log_likelihood=\"74.840976\"taxa=\" ST1_58 ST152_1\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	1992350	1993125	0.000	.	0	node=\"N53->N61\";neg_log_likelihood=\"48.061054\"taxa=\" ST1_58 ST152_1\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	1648686	1675289	0.000	.	0	node=\"N52->N53\";neg_log_likelihood=\"1481.343732\"taxa=\"  ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1\";snp_count=\"251\"\nSEQUENCE	GUBBINS	CDS	1983181	1990908	0.000	.	0	node=\"N52->N53\";neg_log_likelihood=\"680.982373\"taxa=\"  ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1\";snp_count=\"90\"\nSEQUENCE	GUBBINS	CDS	895759	899123	0.000	.	0	node=\"N52->N53\";neg_log_likelihood=\"333.204984\"taxa=\"  ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1\";snp_count=\"54\"\nSEQUENCE	GUBBINS	CDS	939891	951352	0.000	.	0	node=\"N52->N53\";neg_log_likelihood=\"174.683672\"taxa=\"  ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1\";snp_count=\"19\"\nSEQUENCE	GUBBINS	CDS	1173738	1174168	0.000	.	0	node=\"N52->N53\";neg_log_likelihood=\"80.344209\"taxa=\"  ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1\";snp_count=\"11\"\nSEQUENCE	GUBBINS	CDS	854668	923154	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"12274.533769\"taxa=\"ST8_1\";snp_count=\"910\"\nSEQUENCE	GUBBINS	CDS	7231	40824	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"9500.237702\"taxa=\"ST8_1\";snp_count=\"705\"\nSEQUENCE	GUBBINS	CDS	1051130	1085521	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"7280.765553\"taxa=\"ST8_1\";snp_count=\"661\"\nSEQUENCE	GUBBINS	CDS	1110682	1138668	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"5172.640282\"taxa=\"ST8_1\";snp_count=\"540\"\nSEQUENCE	GUBBINS	CDS	2958721	2970009	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"3376.393604\"taxa=\"ST8_1\";snp_count=\"377\"\nSEQUENCE	GUBBINS	CDS	976778	990189	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"2362.147412\"taxa=\"ST8_1\";snp_count=\"196\"\nSEQUENCE	GUBBINS	CDS	1793798	1815096	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"1607.361796\"taxa=\"ST8_1\";snp_count=\"203\"\nSEQUENCE	GUBBINS	CDS	933195	953507	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"741.381821\"taxa=\"ST8_1\";snp_count=\"185\"\nSEQUENCE	GUBBINS	CDS	1173689	1174215	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"247.541692\"taxa=\"ST8_1\";snp_count=\"19\"\nSEQUENCE	GUBBINS	CDS	1992350	1999046	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"186.766281\"taxa=\"ST8_1\";snp_count=\"13\"\nSEQUENCE	GUBBINS	CDS	926598	929583	0.000	.	0	node=\"N52->ST8_1\";neg_log_likelihood=\"136.348420\"taxa=\"ST8_1\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	899423	931305	0.000	.	0	node=\"N65->N66\";neg_log_likelihood=\"1138.020046\"taxa=\" ST7_3 ST7_2\";snp_count=\"438\"\nSEQUENCE	GUBBINS	CDS	190429	190457	0.000	.	0	node=\"N65->N66\";neg_log_likelihood=\"84.056305\"taxa=\" ST7_3 ST7_2\";snp_count=\"12\"\nSEQUENCE	GUBBINS	CDS	917120	932822	0.000	.	0	node=\"N67->ST1_56\";neg_log_likelihood=\"1119.744515\"taxa=\"ST1_56\";snp_count=\"223\"\nSEQUENCE	GUBBINS	CDS	425877	432715	0.000	.	0	node=\"N67->ST1_56\";neg_log_likelihood=\"320.620334\"taxa=\"ST1_56\";snp_count=\"114\"\nSEQUENCE	GUBBINS	CDS	2657113	2746533	0.000	.	0	node=\"N71->ID_2041_BC13\";neg_log_likelihood=\"9279.490855\"taxa=\"ID_2041_BC13\";snp_count=\"5355\"\nSEQUENCE	GUBBINS	CDS	1173689	1192603	0.000	.	0	node=\"N71->ID_2041_BC13\";neg_log_likelihood=\"445.498854\"taxa=\"ID_2041_BC13\";snp_count=\"236\"\nSEQUENCE	GUBBINS	CDS	1693701	1694442	0.000	.	0	node=\"N71->ID_2041_BC13\";neg_log_likelihood=\"105.610471\"taxa=\"ID_2041_BC13\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	1982506	2005678	0.000	.	0	node=\"N70->ID_747970_BC74\";neg_log_likelihood=\"2470.609391\"taxa=\"ID_747970_BC74\";snp_count=\"381\"\nSEQUENCE	GUBBINS	CDS	2960175	2969382	0.000	.	0	node=\"N70->ID_747970_BC74\";neg_log_likelihood=\"1233.872730\"taxa=\"ID_747970_BC74\";snp_count=\"198\"\nSEQUENCE	GUBBINS	CDS	1838063	1846349	0.000	.	0	node=\"N70->ID_747970_BC74\";neg_log_likelihood=\"432.525957\"taxa=\"ID_747970_BC74\";snp_count=\"157\"\nSEQUENCE	GUBBINS	CDS	1997471	2000302	0.000	.	0	node=\"N69->ST1_45\";neg_log_likelihood=\"419.497522\"taxa=\"ST1_45\";snp_count=\"213\"\nSEQUENCE	GUBBINS	CDS	3376219	3399076	0.000	.	0	node=\"N74->ST1_37\";neg_log_likelihood=\"2392.495050\"taxa=\"ST1_37\";snp_count=\"361\"\nSEQUENCE	GUBBINS	CDS	1454818	1471018	0.000	.	0	node=\"N74->ST1_37\";neg_log_likelihood=\"1081.727497\"taxa=\"ST1_37\";snp_count=\"252\"\nSEQUENCE	GUBBINS	CDS	3360975	3365498	0.000	.	0	node=\"N74->ST1_37\";neg_log_likelihood=\"315.586287\"taxa=\"ST1_37\";snp_count=\"91\"\nSEQUENCE	GUBBINS	CDS	696167	755335	0.000	.	0	node=\"N74->ST10_1\";neg_log_likelihood=\"3608.085934\"taxa=\"ST10_1\";snp_count=\"1563\"\nSEQUENCE	GUBBINS	CDS	775012	777299	0.000	.	0	node=\"N74->ST10_1\";neg_log_likelihood=\"285.824060\"taxa=\"ST10_1\";snp_count=\"68\"\nSEQUENCE	GUBBINS	CDS	948967	952146	0.000	.	0	node=\"N74->ST10_1\";neg_log_likelihood=\"95.529421\"taxa=\"ST10_1\";snp_count=\"21\"\nSEQUENCE	GUBBINS	CDS	914955	967396	0.000	.	0	node=\"N76->ST390_1\";neg_log_likelihood=\"1374.462574\"taxa=\"ST390_1\";snp_count=\"625\"\nSEQUENCE	GUBBINS	CDS	720073	720104	0.000	.	0	node=\"N76->ST1_14\";neg_log_likelihood=\"70.441476\"taxa=\"ST1_14\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	1173689	1173761	0.000	.	0	node=\"N75->ID_6885_BC41\";neg_log_likelihood=\"191.416010\"taxa=\"ID_6885_BC41\";snp_count=\"10\"\nSEQUENCE	GUBBINS	CDS	1765612	1766927	0.000	.	0	node=\"N75->ID_6885_BC41\";neg_log_likelihood=\"154.587068\"taxa=\"ID_6885_BC41\";snp_count=\"9\"\nSEQUENCE	GUBBINS	CDS	1994399	2001091	0.000	.	0	node=\"N72->ST1_53\";neg_log_likelihood=\"1476.370364\"taxa=\"ST1_53\";snp_count=\"348\"\nSEQUENCE	GUBBINS	CDS	1628854	1634840	0.000	.	0	node=\"N72->ST1_53\";neg_log_likelihood=\"661.586457\"taxa=\"ST1_53\";snp_count=\"100\"\nSEQUENCE	GUBBINS	CDS	1154905	1159167	0.000	.	0	node=\"N72->ST1_53\";neg_log_likelihood=\"286.592633\"taxa=\"ST1_53\";snp_count=\"61\"\nSEQUENCE	GUBBINS	CDS	2258179	2309479	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"11970.309951\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"1402\"\nSEQUENCE	GUBBINS	CDS	1988947	2036482	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"8181.687904\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"949\"\nSEQUENCE	GUBBINS	CDS	613529	624131	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"5803.384527\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"269\"\nSEQUENCE	GUBBINS	CDS	713674	720333	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"4930.117648\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"217\"\nSEQUENCE	GUBBINS	CDS	1782638	1811993	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"4197.429905\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"289\"\nSEQUENCE	GUBBINS	CDS	917023	933108	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"3171.149812\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"233\"\nSEQUENCE	GUBBINS	CDS	568300	576793	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"2352.347055\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"174\"\nSEQUENCE	GUBBINS	CDS	2685258	2688678	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"1734.238904\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"122\"\nSEQUENCE	GUBBINS	CDS	1304731	1326450	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"1268.301328\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"155\"\nSEQUENCE	GUBBINS	CDS	2067801	2071190	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"740.252534\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"60\"\nSEQUENCE	GUBBINS	CDS	789607	797972	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"536.612324\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"41\"\nSEQUENCE	GUBBINS	CDS	1135667	1142949	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"370.948301\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"29\"\nSEQUENCE	GUBBINS	CDS	1838009	1839319	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"236.156041\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"19\"\nSEQUENCE	GUBBINS	CDS	1068888	1075051	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"163.833815\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"16\"\nSEQUENCE	GUBBINS	CDS	1250656	1254075	0.000	.	0	node=\"N72->N73\";neg_log_likelihood=\"97.683249\"taxa=\"  ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"8\"\nSEQUENCE	GUBBINS	CDS	1994067	2001091	0.000	.	0	node=\"N68->N69\";neg_log_likelihood=\"325.226111\"taxa=\" ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13\";snp_count=\"135\"\nSEQUENCE	GUBBINS	CDS	23703	41752	0.000	.	0	node=\"N63->N64\";neg_log_likelihood=\"2487.107059\"taxa=\"   ST7_3 ST7_2 ST1_29  ST1_44 ST1_56\";snp_count=\"254\"\nSEQUENCE	GUBBINS	CDS	54158	60859	0.000	.	0	node=\"N63->N64\";neg_log_likelihood=\"1497.978424\"taxa=\"   ST7_3 ST7_2 ST1_29  ST1_44 ST1_56\";snp_count=\"199\"\nSEQUENCE	GUBBINS	CDS	622300	628159	0.000	.	0	node=\"N63->N64\";neg_log_likelihood=\"848.555351\"taxa=\"   ST7_3 ST7_2 ST1_29  ST1_44 ST1_56\";snp_count=\"120\"\nSEQUENCE	GUBBINS	CDS	1818963	1822135	0.000	.	0	node=\"N63->N64\";neg_log_likelihood=\"454.604853\"taxa=\"   ST7_3 ST7_2 ST1_29  ST1_44 ST1_56\";snp_count=\"58\"\nSEQUENCE	GUBBINS	CDS	1994515	2001118	0.000	.	0	node=\"N63->N64\";neg_log_likelihood=\"182.625278\"taxa=\"   ST7_3 ST7_2 ST1_29  ST1_44 ST1_56\";snp_count=\"57\"\nSEQUENCE	GUBBINS	CDS	2504111	2504125	0.000	.	0	node=\"N63->N68\";neg_log_likelihood=\"90.958496\"taxa=\"  ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13  ST1_53   ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"6\"\nSEQUENCE	GUBBINS	CDS	1173818	1174171	0.000	.	0	node=\"N63->N68\";neg_log_likelihood=\"65.587528\"taxa=\"  ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13  ST1_53   ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"6\"\nSEQUENCE	GUBBINS	CDS	1994399	2001091	0.000	.	0	node=\"N77->ST1_2\";neg_log_likelihood=\"695.607009\"taxa=\"ST1_2\";snp_count=\"348\"\nSEQUENCE	GUBBINS	CDS	888224	955432	0.000	.	0	node=\"N77->N78\";neg_log_likelihood=\"8374.960107\"taxa=\" ST6_1  ST1_52 ST1_51\";snp_count=\"1523\"\nSEQUENCE	GUBBINS	CDS	964978	990570	0.000	.	0	node=\"N77->N78\";neg_log_likelihood=\"4358.222412\"taxa=\" ST6_1  ST1_52 ST1_51\";snp_count=\"639\"\nSEQUENCE	GUBBINS	CDS	471846	488208	0.000	.	0	node=\"N77->N78\";neg_log_likelihood=\"2387.300188\"taxa=\" ST6_1  ST1_52 ST1_51\";snp_count=\"387\"\nSEQUENCE	GUBBINS	CDS	500118	510563	0.000	.	0	node=\"N77->N78\";neg_log_likelihood=\"1055.102646\"taxa=\" ST6_1  ST1_52 ST1_51\";snp_count=\"252\"\nSEQUENCE	GUBBINS	CDS	1994336	2003488	0.000	.	0	node=\"N77->N78\";neg_log_likelihood=\"296.358965\"taxa=\" ST6_1  ST1_52 ST1_51\";snp_count=\"100\"\nSEQUENCE	GUBBINS	CDS	2503938	2533058	0.000	.	0	node=\"N62->N63\";neg_log_likelihood=\"472.842420\"taxa=\"    ST7_3 ST7_2 ST1_29  ST1_44 ST1_56   ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13  ST1_53   ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"129\"\nSEQUENCE	GUBBINS	CDS	2592582	2599836	0.000	.	0	node=\"N62->N63\";neg_log_likelihood=\"100.295278\"taxa=\"    ST7_3 ST7_2 ST1_29  ST1_44 ST1_56   ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13  ST1_53   ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"8\"\nSEQUENCE	GUBBINS	CDS	2552448	2558952	0.000	.	0	node=\"N62->N63\";neg_log_likelihood=\"57.969953\"taxa=\"    ST7_3 ST7_2 ST1_29  ST1_44 ST1_56   ST1_45  ID_747970_BC74  ID_1688_BC8 ID_2041_BC13  ST1_53   ST1_37 ST10_1  ID_6885_BC41  ST390_1 ST1_14\";snp_count=\"7\"\nSEQUENCE	GUBBINS	CDS	942814	944200	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"2691.486301\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"126\"\nSEQUENCE	GUBBINS	CDS	1443483	1481944	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"2329.288059\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"172\"\nSEQUENCE	GUBBINS	CDS	1490300	1520516	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"1692.736923\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"132\"\nSEQUENCE	GUBBINS	CDS	3299584	3315343	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"1211.449408\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"80\"\nSEQUENCE	GUBBINS	CDS	2619241	2634290	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"927.826599\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"49\"\nSEQUENCE	GUBBINS	CDS	787507	792757	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"745.097931\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"25\"\nSEQUENCE	GUBBINS	CDS	1790015	1796290	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"651.984497\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"17\"\nSEQUENCE	GUBBINS	CDS	1530132	1552679	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"576.088689\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"23\"\nSEQUENCE	GUBBINS	CDS	2647068	2648366	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"473.283705\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"12\"\nSEQUENCE	GUBBINS	CDS	1573150	1584046	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"421.210599\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"16\"\nSEQUENCE	GUBBINS	CDS	1725961	1732862	0.000	.	0	node=\"N62->N77\";neg_log_likelihood=\"359.931709\"taxa=\" ST1_2  ST6_1  ST1_52 ST1_51\";snp_count=\"7\"\nSEQUENCE	GUBBINS	CDS	2055666	2061785	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"857.521413\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"46\"\nSEQUENCE	GUBBINS	CDS	1995656	2000140	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"665.037793\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"39\"\nSEQUENCE	GUBBINS	CDS	2072723	2076994	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"499.123522\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"34\"\nSEQUENCE	GUBBINS	CDS	2084600	2094628	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"366.445171\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"27\"\nSEQUENCE	GUBBINS	CDS	1173705	1174168	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"238.736126\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"16\"\nSEQUENCE	GUBBINS	CDS	467796	476192	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"176.816847\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"16\"\nSEQUENCE	GUBBINS	CDS	2928006	2929589	0.000	.	0	node=\"N1->N2\";neg_log_likelihood=\"115.063106\"taxa=\"  ST1_8  ST5_2  ST5_1 ST5_3       ST1_30   ST1_54 ST1_50 ST1_49 ST1_31   ST1_18 ST1_17 ID_1690_BC9  ST1_15 ST1_3   ST1_7 ST1_16   ID_891_BC5  ID_598_BC4 ID_2947_BC18     ST1_39  ST1_11  ST1_34  ST1_33  ST1_42  ST1_40 ST1_41   ST1_57 ID_1828_BC10   ST1_20  ST1_6 ST1_9   ST1_43  ST1_35 ST1_38   ST1_32 Paris ST1_59      ST1_55 ST1_26  ST1_10 ST1_47  ST1_27 ST1_46 ST1_36  ST7_1  ST1_12  ST1_28  ST72_1 ST1_13 ST1_48 ID_2948_BC19\";snp_count=\"5\"\nSEQUENCE	GUBBINS	CDS	923453	950029	0.000	.	0	node=\"N1->N52\";neg_log_likelihood=\"1016.653850\"taxa=\"   ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1 ST8_1\";snp_count=\"258\"\nSEQUENCE	GUBBINS	CDS	1991641	1997009	0.000	.	0	node=\"N1->N52\";neg_log_likelihood=\"195.086105\"taxa=\"   ST1_22    ST1_19  ST1_25  ST1_5 ST1_24  ST1_23 ST1_21 ST1_4  ST1_58 ST152_1 ST8_1\";snp_count=\"75\"\n"
	// end of gff (var gff_string)
	return gff_string
}

