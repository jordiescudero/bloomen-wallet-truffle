pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract Json  {

  struct PathValue{
    string path;
    string value;
  }

  PathValue[] data_;

  function getNodes() public view returns (PathValue[]){    
    return data_;
  }

  function addPathData(string _path, string  _data) public {
    PathValue memory result = PathValue(_path, _data);
    data_.push(result);
  }
}