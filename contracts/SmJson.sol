// File: `./contracts/SimpleStorage.sol`

pragma solidity ^0.4.17;
pragma experimental ABIEncoderV2;

contract SmJson {

  struct PathValue{
    string path;
    string value;
  }

  mapping (bytes32 => uint) private hashIndexMap_;

  PathValue[] private data_;

  function getNodes() public view returns (PathValue[]){    
    return data_;
  }

  function addPathData(string _path, string _value) public {
    PathValue memory pathValue = PathValue(_path, _value);
    data_.push(pathValue);
    bytes32 pathHash = keccak256(_path);
    hashIndexMap_[pathHash] = data_.length - 1;
  }

  function deletePath(string _path) public {
    bytes32 pathHash = keccak256(_path);
    uint index = hashIndexMap_[pathHash];
    delete data_[index];
  }

  function modify(string _path, string _value) public {
    bytes32 pathHash = keccak256(_path);
    uint index = hashIndexMap_[pathHash];
    data_[index] = PathValue(_path, _value);
  }

}