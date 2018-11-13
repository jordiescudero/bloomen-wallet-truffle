pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./Json.sol"; 

contract BloomenDapp is Json {

    constructor() public {
      addPathData("a.b.c.@type","Asset");
      addPathData("a.b.c.name", "My new Song");
      addPathData("a.b.c.author", "My new Song");
      addPathData("a.b.c.lyrics", "Nulla facilisi. Nullam risus dui, egestas sit amet consectetur quis, suscipit vitae sapien. Aliquam nulla ipsum, lacinia quis ligula sed, convallis convallis magna. Ut vitae neque sagittis, faucibus odio ac, accumsan odio. Quisque mattis ligula quis risus luctus, ac maximus diam varius. Sed eget ligula dui. Nunc eu dui pellentesque, consequat felis ullamcorper, auctor leo. Ut a lacus facilisis, mollis magna vel, viverra massa. Integer euismod lorem vel ex sollicitudin congue. Quisque non viverra justo. Aliquam ac vehicula arcu, at faucibus ligula. Nam a rhoncus mauris. Etiam in gravida ipsum, at venenatis mi. Duis luctus odio et hendrerit facilisis. Quisque tristique tortor ornare mattis finibus. Donec commodo mi et felis sagittis, lobortis placerat risus faucibus.");
    }
    
}